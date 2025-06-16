use tauri::{LogicalPosition, TitleBarStyle, WebviewUrl, WebviewWindowBuilder};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .setup(|app| {
            let win_builder = WebviewWindowBuilder::new(app, "main", WebviewUrl::default())
                .title("Transparent Titlebar Window")
                .inner_size(1000.0, 800.0)
                .min_inner_size(900.0, 700.0);

            #[cfg(target_os = "macos")]
            let win_builder = win_builder.title_bar_style(TitleBarStyle::Overlay);

            #[cfg(target_os = "macos")]
            let win_builder = win_builder.traffic_light_position(LogicalPosition::new(20.0, 24.0));

            #[cfg(target_os = "windows")]
            let win_builder = win_builder.decorations(false);

            let win_builder = win_builder.hidden_title(true);

            let _ = win_builder.build().unwrap();

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
