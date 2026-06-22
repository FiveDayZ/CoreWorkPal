use tauri::{AppHandle, Emitter, Manager};

use crate::{
    app_state::AppState,
    models::{current_timestamp_ms, AppSettings, CatState, CatStateChangedEvent, HardwareSnapshot},
};

const MIN_STATE_HOLD_MS: i64 = 3_000;
const REPAIR_LIGHT_LOAD_THRESHOLD: f32 = 76.0;
const REPAIR_HEAVY_LOAD_THRESHOLD: f32 = 92.0;
const TEMPERATURE_CHECK_ENTER_MIN_CELSIUS: f32 = 75.0;
const TEMPERATURE_CHECK_EXIT_CELSIUS: f32 = 70.0;
const TEMPERATURE_CHECK_EXIT_STABLE_MS: i64 = 5_000;

pub struct PetStateService;

impl PetStateService {
    pub async fn update_for_snapshot(app: &AppHandle, snapshot: &HardwareSnapshot) {
        let now_ms = current_timestamp_ms();
        let state = app.state::<AppState>();
        let settings = state.settings.read().await.clone();
        let current = state.cat_state.read().await.clone();
        let current_temperature_safe_since = *state.temperature_safe_since.read().await;
        let temperature_safe_since = next_temperature_safe_since(
            &settings,
            snapshot,
            &current,
            current_temperature_safe_since,
            now_ms,
        );
        let candidate = resolve_candidate_state(
            &settings,
            snapshot,
            &current,
            temperature_safe_since,
            now_ms,
        );
        let last_changed_at = *state.last_cat_state_changed_at.read().await;
        let has_emitted = *state.has_emitted_cat_state.read().await;
        {
            let mut safe_since = state.temperature_safe_since.write().await;
            *safe_since = temperature_safe_since;
        }

        if has_emitted
            && !should_transition(&current, &candidate, now_ms.saturating_sub(last_changed_at))
        {
            return;
        }

        let message = message_for_state(&candidate).to_string();

        {
            let mut cat_state = state.cat_state.write().await;
            *cat_state = candidate.clone();
        }
        {
            let mut cat_message = state.cat_message.write().await;
            *cat_message = message.clone();
        }
        {
            let mut changed_at = state.last_cat_state_changed_at.write().await;
            *changed_at = now_ms;
        }
        {
            let mut emitted = state.has_emitted_cat_state.write().await;
            *emitted = true;
        }

        let payload = CatStateChangedEvent {
            timestamp: now_ms,
            cat_state: candidate,
            cat_message: message,
        };

        if let Err(error) = app.emit("pet:state-changed", payload) {
            tracing::warn!("failed to emit pet:state-changed: {error}");
        }
    }
}

fn resolve_candidate_state(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
    current: &CatState,
    temperature_safe_since: Option<i64>,
    now_ms: i64,
) -> CatState {
    if !settings.is_cat_visible {
        return CatState::Hidden;
    }

    if settings.is_production_paused {
        return CatState::Sleep;
    }

    if is_temperature_warning(settings, snapshot, current, temperature_safe_since, now_ms) {
        return CatState::TemperatureCheck;
    }

    if snapshot
        .memory_usage_percent
        .is_some_and(|value| value > settings.memory_crowded_threshold)
    {
        return CatState::MemoryCrowded;
    }

    if is_heavy_load(snapshot) {
        return CatState::RepairHeavy;
    }

    if snapshot
        .cpu_usage_percent
        .is_some_and(|value| value >= settings.data_sorting_cpu_threshold)
    {
        return CatState::RepairLight;
    }

    if is_sustained_busy_load(snapshot) {
        return CatState::RepairLight;
    }

    CatState::Idle
}

fn is_temperature_warning(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
    current: &CatState,
    temperature_safe_since: Option<i64>,
    now_ms: i64,
) -> bool {
    if is_temperature_above_enter_threshold(settings, snapshot) {
        return true;
    }

    if current != &CatState::TemperatureCheck {
        return false;
    }

    if !is_temperature_below_exit_threshold(snapshot) {
        return true;
    }

    temperature_safe_since
        .is_some_and(|safe_since| now_ms.saturating_sub(safe_since) < TEMPERATURE_CHECK_EXIT_STABLE_MS)
}

fn is_temperature_above_enter_threshold(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
) -> bool {
    let cpu_warning = settings
        .cpu_temperature_warning
        .max(TEMPERATURE_CHECK_ENTER_MIN_CELSIUS);
    let gpu_warning = settings
        .gpu_temperature_warning
        .max(TEMPERATURE_CHECK_ENTER_MIN_CELSIUS);

    snapshot
        .cpu_temperature_celsius
        .is_some_and(|value| value > cpu_warning)
        || snapshot
            .gpu_temperature_celsius
            .is_some_and(|value| value > gpu_warning)
}

fn is_temperature_below_exit_threshold(snapshot: &HardwareSnapshot) -> bool {
    let mut has_temperature = false;
    let mut all_safe = true;

    for value in [
        snapshot.cpu_temperature_celsius,
        snapshot.gpu_temperature_celsius,
    ]
    .into_iter()
    .flatten()
    {
        if !value.is_finite() {
            continue;
        }

        has_temperature = true;
        all_safe &= value < TEMPERATURE_CHECK_EXIT_CELSIUS;
    }

    !has_temperature || all_safe
}

fn next_temperature_safe_since(
    settings: &AppSettings,
    snapshot: &HardwareSnapshot,
    current: &CatState,
    current_safe_since: Option<i64>,
    now_ms: i64,
) -> Option<i64> {
    if is_temperature_above_enter_threshold(settings, snapshot) {
        return None;
    }

    if current == &CatState::TemperatureCheck && is_temperature_below_exit_threshold(snapshot) {
        return Some(current_safe_since.unwrap_or(now_ms));
    }

    None
}

fn is_heavy_load(snapshot: &HardwareSnapshot) -> bool {
    snapshot
        .cpu_usage_percent
        .is_some_and(|value| value >= REPAIR_HEAVY_LOAD_THRESHOLD)
        || snapshot
            .gpu_usage_percent
            .is_some_and(|value| value >= REPAIR_HEAVY_LOAD_THRESHOLD)
}

fn is_sustained_busy_load(snapshot: &HardwareSnapshot) -> bool {
    snapshot
        .gpu_usage_percent
        .is_some_and(|value| value >= REPAIR_LIGHT_LOAD_THRESHOLD)
}

fn should_transition(current: &CatState, candidate: &CatState, elapsed_ms: i64) -> bool {
    if current == candidate {
        return false;
    }

    if severity(candidate) > severity(current) {
        return true;
    }

    elapsed_ms >= MIN_STATE_HOLD_MS
}

fn severity(state: &CatState) -> u8 {
    match state {
        CatState::Hidden => 100,
        CatState::TemperatureCheck => 90,
        CatState::RepairHeavy => 80,
        CatState::MemoryCrowded => 70,
        CatState::RepairLight => 50,
        CatState::Sleep => 40,
        CatState::DataSorting => 30,
        CatState::Celebrate => 15,
        CatState::Interactive => 8,
        CatState::Idle => 0,
    }
}

fn message_for_state(state: &CatState) -> &'static str {
    match state {
        CatState::Idle => "CoreCat 正在待命。",
        CatState::RepairLight => "检测到轻量维护负载。",
        CatState::RepairHeavy => "系统负载偏高，CoreCat 正在检修。",
        CatState::TemperatureCheck => "温度偏高，正在关注散热状态。",
        CatState::MemoryCrowded => "内存较拥挤，建议留意后台任务。",
        CatState::DataSorting => "系统空闲，CoreCat 正在整理数据。",
        CatState::Sleep => "长时间未操作，CoreCat 进入休眠。",
        CatState::Interactive => "CoreCat 正在响应你的操作。",
        CatState::Celebrate => "清理完成，工坊状态良好。",
        CatState::Hidden => "",
    }
}

#[cfg(test)]
mod tests {
    use crate::models::{AppSettings, CatState, HardwareSnapshot};

    use super::{resolve_candidate_state, should_transition};

    fn candidate(settings: &AppSettings, snapshot: &HardwareSnapshot) -> CatState {
        resolve_candidate_state(settings, snapshot, &CatState::Idle, None, 1_000)
    }

    #[test]
    fn hidden_setting_overrides_snapshot() {
        let mut settings = AppSettings::default();
        settings.is_cat_visible = false;
        let snapshot = HardwareSnapshot {
            cpu_usage_percent: Some(95.0),
            ..Default::default()
        };

        assert_eq!(
            candidate(&settings, &snapshot),
            CatState::Hidden
        );
    }

    #[test]
    fn working_cpu_threshold_maps_to_repair_light() {
        let settings = AppSettings::default();
        let snapshot = HardwareSnapshot {
            cpu_usage_percent: Some(40.0),
            ..Default::default()
        };

        assert_eq!(
            candidate(&settings, &snapshot),
            CatState::RepairLight
        );
    }

    #[test]
    fn ram_above_threshold_maps_to_memory_crowded() {
        let settings = AppSettings::default();
        let snapshot = HardwareSnapshot {
            memory_usage_percent: Some(85.1),
            ..Default::default()
        };

        assert_eq!(
            candidate(&settings, &snapshot),
            CatState::MemoryCrowded
        );
    }

    #[test]
    fn high_load_maps_to_repair_states() {
        let settings = AppSettings::default();

        assert_eq!(
            candidate(
                &settings,
                &HardwareSnapshot {
                    cpu_usage_percent: Some(92.0),
                    ..Default::default()
                }
            ),
            CatState::RepairHeavy
        );
        assert_eq!(
            candidate(
                &settings,
                &HardwareSnapshot {
                    gpu_usage_percent: Some(76.0),
                    ..Default::default()
                }
            ),
            CatState::RepairLight
        );
    }

    #[test]
    fn temperature_above_threshold_maps_to_temperature_check() {
        let settings = AppSettings::default();
        let snapshot = HardwareSnapshot {
            cpu_temperature_celsius: Some(80.1),
            ..Default::default()
        };

        assert_eq!(
            candidate(&settings, &snapshot),
            CatState::TemperatureCheck
        );
    }

    #[test]
    fn moderate_temperature_does_not_enter_temperature_check() {
        let mut settings = AppSettings::default();
        settings.cpu_temperature_warning = 50.0;
        let snapshot = HardwareSnapshot {
            cpu_temperature_celsius: Some(60.0),
            ..Default::default()
        };

        assert_eq!(candidate(&settings, &snapshot), CatState::Idle);
    }

    #[test]
    fn temperature_check_exits_after_safe_temperature_is_stable() {
        let settings = AppSettings::default();
        let snapshot = HardwareSnapshot {
            cpu_temperature_celsius: Some(60.0),
            ..Default::default()
        };

        assert_eq!(
            resolve_candidate_state(
                &settings,
                &snapshot,
                &CatState::TemperatureCheck,
                Some(1_000),
                5_999,
            ),
            CatState::TemperatureCheck
        );
        assert_eq!(
            resolve_candidate_state(
                &settings,
                &snapshot,
                &CatState::TemperatureCheck,
                Some(1_000),
                6_000,
            ),
            CatState::Idle
        );
    }

    #[test]
    fn configured_thresholds_drive_candidate_state() {
        let mut settings = AppSettings::default();
        settings.data_sorting_cpu_threshold = 15.0;
        settings.cpu_temperature_warning = 78.0;

        assert_eq!(
            candidate(
                &settings,
                &HardwareSnapshot {
                    cpu_usage_percent: Some(16.0),
                    ..Default::default()
                }
            ),
            CatState::RepairLight
        );
        assert_eq!(
            candidate(
                &settings,
                &HardwareSnapshot {
                    cpu_temperature_celsius: Some(79.0),
                    cpu_usage_percent: Some(16.0),
                    ..Default::default()
                }
            ),
            CatState::TemperatureCheck
        );
        assert_eq!(
            candidate(
                &settings,
                &HardwareSnapshot {
                    cpu_temperature_celsius: Some(79.0),
                    ..Default::default()
                }
            ),
            CatState::TemperatureCheck
        );
    }

    #[test]
    fn ordinary_state_waits_for_hold_window() {
        assert!(!should_transition(
            &CatState::MemoryCrowded,
            &CatState::Idle,
            1_000
        ));
        assert!(should_transition(
            &CatState::MemoryCrowded,
            &CatState::Idle,
            3_000
        ));
    }

    #[test]
    fn severe_state_can_override_immediately() {
        assert!(should_transition(
            &CatState::Idle,
            &CatState::TemperatureCheck,
            0
        ));
    }
}
