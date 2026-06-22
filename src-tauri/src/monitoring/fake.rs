use crate::{
    models::{current_timestamp_ms, HardwareSnapshot},
    monitoring::HardwareSensorAdapter,
};

pub struct FakeHardwareSensorAdapter {
    tick: u64,
}

impl FakeHardwareSensorAdapter {
    pub fn new() -> Self {
        Self { tick: 0 }
    }
}

impl HardwareSensorAdapter for FakeHardwareSensorAdapter {
    fn sample(&mut self) -> HardwareSnapshot {
        self.tick = self.tick.wrapping_add(1);
        let wave = (self.tick % 40) as f32;
        let cpu = 20.0 + wave;
        let memory = 45.0 + (wave / 2.0);

        HardwareSnapshot {
            timestamp: current_timestamp_ms(),
            cpu_usage_percent: Some(cpu),
            gpu_usage_percent: None,
            memory_usage_percent: Some(memory),
            cpu_temperature_celsius: None,
            gpu_temperature_celsius: None,
            disk_read_bytes_per_second: Some(64_000.0 + wave * 1000.0),
            disk_write_bytes_per_second: Some(32_000.0 + wave * 750.0),
            network_download_bytes_per_second: Some(120_000.0 + wave * 1500.0),
            network_upload_bytes_per_second: Some(24_000.0 + wave * 500.0),
            cpu_name: Some("Fake CPU".to_string()),
            gpu_name: Some("Fake GPU".to_string()),
            gpu_memory_used_bytes: Some((1.4 * 1024.0 * 1024.0 * 1024.0) as u64),
            gpu_memory_total_bytes: Some(8 * 1024 * 1024 * 1024),
            total_memory_bytes: Some(16 * 1024 * 1024 * 1024),
            used_memory_bytes: Some(((memory / 100.0) * 16.0 * 1024.0 * 1024.0 * 1024.0) as u64),
        }
    }
}
