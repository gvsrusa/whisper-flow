use reqwest::blocking::Client;
use reqwest::blocking::multipart;
use serde_json::Value;
use std::path::Path;

pub fn transcribe_openai_compatible(
    file_path: &Path,
    api_key: &str,
    model: &str,
    base_url: &str
) -> Result<String, String> {
    let client = Client::new();
    
    // Create multipart form
    // Note: reqwest blocking multipart might behave differently depending on version, 
    // ensuring we strictly follow the file upload pattern.
    let form = multipart::Form::new()
        .file("file", file_path).map_err(|e| e.to_string())?
        .text("model", model.to_string());

    // Some providers might need "language" or other fields, but this is minimal.

    let res = client.post(format!("{}/audio/transcriptions", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .multipart(form)
        .send()
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().unwrap_or_default();
        return Err(format!("API Error {}: {}", status, text));
    }

    let json: Value = res.json().map_err(|e| e.to_string())?;
    
    // Extract text
    if let Some(text) = json.get("text") {
        if let Some(t) = text.as_str() {
            return Ok(t.to_string());
        }
    }

    Err("Invalid response format: 'text' field missing".to_string())
}
