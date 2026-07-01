use std::sync::{Arc, Mutex};

use tokio::sync::RwLock;

use crate::{
    achievements::AchievementBook,
    models::{
        current_timestamp_ms, AppSettings, CatState, HardwareSnapshot, LayoutState, WorkLogBook,
        WorkshopState,
    },
    monitoring::{create_default_adapter, HardwareSensorAdapter},
    storage::StorageService,
};

pub struct AppState {
    pub settings: RwLock<AppSettings>,
    pub workshop: RwLock<WorkshopState>,
    pub layout: RwLock<LayoutState>,
    pub work_logs: RwLock<WorkLogBook>,
    pub achievements: RwLock<AchievementBook>,
    pub last_snapshot: RwLock<Option<HardwareSnapshot>>,
    pub cat_state: RwLock<CatState>,
    pub cat_message: RwLock<String>,
    pub last_cat_state_changed_at: RwLock<i64>,
    pub temperature_safe_since: RwLock<Option<i64>>,
    pub has_emitted_cat_state: RwLock<bool>,
    pub storage: StorageService,
    /// `Arc` so the adapter can be cloned into `spawn_blocking` closures,
    /// keeping subprocess work (nvidia-smi / powershell) off the async runtime.
    pub hardware_adapter: Arc<Mutex<Box<dyn HardwareSensorAdapter>>>,
}

impl AppState {
    pub fn load() -> Result<Self, String> {
        let storage = StorageService::new().map_err(|error| error.to_string())?;
        let settings = storage.load_or_create_settings()?;
        let workshop = storage.load_or_create_workshop()?;
        let layout = storage.load_or_create_layout()?;
        let work_logs = storage.load_or_create_work_logs()?;
        let achievements = storage.load_or_create_achievements()?;

        Ok(Self {
            settings: RwLock::new(settings),
            workshop: RwLock::new(workshop),
            layout: RwLock::new(layout),
            work_logs: RwLock::new(work_logs),
            achievements: RwLock::new(achievements),
            last_snapshot: RwLock::new(None),
            cat_state: RwLock::new(CatState::Idle),
            cat_message: RwLock::new("CoreCat 正在待命。".to_string()),
            last_cat_state_changed_at: RwLock::new(current_timestamp_ms()),
            temperature_safe_since: RwLock::new(None),
            has_emitted_cat_state: RwLock::new(false),
            storage,
            hardware_adapter: Arc::new(Mutex::new(create_default_adapter())),
        })
    }
}
