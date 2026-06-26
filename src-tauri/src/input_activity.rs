use std::time::Duration;

use tauri::{AppHandle, Emitter, Manager};

use crate::{
    app_state::AppState,
    commands::record_internal_achievement_event,
    models::{current_timestamp_ms, date_key_from_timestamp, WorkLogEntry, WorkLogReport},
};

#[derive(Debug, Default, Clone, Copy)]
struct InputActivityDelta {
    mouse_clicks: u64,
    keyboard_presses: u64,
}

impl InputActivityDelta {
    fn add(&mut self, other: InputActivityDelta) {
        self.mouse_clicks = self.mouse_clicks.saturating_add(other.mouse_clicks);
        self.keyboard_presses = self.keyboard_presses.saturating_add(other.keyboard_presses);
    }

    fn is_empty(self) -> bool {
        self.mouse_clicks == 0 && self.keyboard_presses == 0
    }

    fn take(&mut self) -> Self {
        let current = *self;
        *self = Self::default();
        current
    }
}

pub fn start_input_activity_pump(app: AppHandle) {
    tauri::async_runtime::spawn(async move {
        let mut poller = InputActivityPoller::new();
        let mut pending = InputActivityDelta::default();
        let mut ticks_since_flush = 0_u32;

        loop {
            pending.add(poller.poll());
            ticks_since_flush = ticks_since_flush.saturating_add(1);

            if ticks_since_flush >= 30 {
                ticks_since_flush = 0;
                let delta = pending.take();
                if !delta.is_empty() {
                    flush_input_activity(&app, delta).await;
                }
            }

            tokio::time::sleep(Duration::from_millis(33)).await;
        }
    });
}

async fn flush_input_activity(app: &AppHandle, delta: InputActivityDelta) {
    let state = app.state::<AppState>();
    let timestamp = current_timestamp_ms();
    let date = date_key_from_timestamp(timestamp);
    let updated_report = {
        let mut work_logs = state.work_logs.write().await;
        let entry = work_logs
            .entries
            .entry(date.clone())
            .or_insert_with(|| WorkLogEntry {
                date,
                ..Default::default()
            });

        entry.record_input_activity_at(delta.mouse_clicks, delta.keyboard_presses, timestamp);
        let report = WorkLogReport::from_entry(entry.clone());

        if let Err(error) = state.storage.save_work_logs(&work_logs) {
            tracing::warn!("failed to save input activity to work log: {error}");
        }

        report
    };

    if let Err(error) = app.emit("worklog:updated", updated_report) {
        tracing::warn!("failed to emit worklog:updated after input activity: {error}");
    }

    if let Err(error) = record_internal_achievement_event(
        app,
        "hardware.segment_rollup",
        format!("input.activity:{timestamp}"),
        serde_json::json!({
            "mouseClickCount": delta.mouse_clicks,
            "keyboardPressCount": delta.keyboard_presses,
        }),
    )
    .await
    {
        tracing::warn!("failed to record input achievement event: {error}");
    }
}

#[cfg(windows)]
struct InputActivityPoller {
    previous_down: [bool; 256],
}

#[cfg(windows)]
impl InputActivityPoller {
    fn new() -> Self {
        Self {
            previous_down: [false; 256],
        }
    }

    fn poll(&mut self) -> InputActivityDelta {
        use windows::Win32::UI::Input::KeyboardAndMouse::GetAsyncKeyState;

        const MOUSE_BUTTONS: [usize; 5] = [0x01, 0x02, 0x04, 0x05, 0x06];
        const AGGREGATE_MODIFIER_KEYS: [usize; 3] = [0x10, 0x11, 0x12];
        let mut delta = InputActivityDelta::default();

        for vk in 0x01_usize..=0xfe {
            let is_down = unsafe { GetAsyncKeyState(vk as i32) } < 0;
            let was_down = self.previous_down[vk];

            if is_down && !was_down {
                if MOUSE_BUTTONS.contains(&vk) {
                    delta.mouse_clicks = delta.mouse_clicks.saturating_add(1);
                } else if AGGREGATE_MODIFIER_KEYS.contains(&vk) {
                    // Count left/right modifier keys, not the aggregate aliases.
                } else {
                    delta.keyboard_presses = delta.keyboard_presses.saturating_add(1);
                }
            }

            self.previous_down[vk] = is_down;
        }

        delta
    }
}

#[cfg(not(windows))]
struct InputActivityPoller;

#[cfg(not(windows))]
impl InputActivityPoller {
    fn new() -> Self {
        Self
    }

    fn poll(&mut self) -> InputActivityDelta {
        InputActivityDelta::default()
    }
}
