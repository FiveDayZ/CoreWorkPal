#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    if !acquire_single_instance() {
        return;
    }

    core_work_pal_lib::run()
}

#[cfg(windows)]
fn acquire_single_instance() -> bool {
    use std::sync::OnceLock;
    use windows::{
        core::w,
        Win32::{
            Foundation::{GetLastError, ERROR_ALREADY_EXISTS},
            System::Threading::CreateMutexW,
        },
    };

    static INSTANCE_MUTEX: OnceLock<usize> = OnceLock::new();

    let Ok(handle) =
        (unsafe { CreateMutexW(None, true, w!("Local\\CoreWorkPal.SingleInstance")) })
    else {
        return true;
    };

    if unsafe { GetLastError() } == ERROR_ALREADY_EXISTS {
        return false;
    }

    let _ = INSTANCE_MUTEX.set(handle.0 as usize);
    true
}

#[cfg(not(windows))]
fn acquire_single_instance() -> bool {
    true
}
