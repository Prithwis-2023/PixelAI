use std::path::Path;
use std::process::Command;

use crate::pipeline::normalizer::concise_text;

#[derive(Debug, Clone)]
pub struct OcrOutput {
    pub summary: String,
    pub success: bool,
    pub raw_text: Option<String>,
    pub engine: String,
}

pub fn summarize_image(path: &Path) -> OcrOutput {
    if let Some(text) = run_vision_ocr(path) {
        let summary = concise_text(&text, 220);
        return OcrOutput {
            summary: if summary.is_empty() {
                "ocr_empty".to_string()
            } else {
                summary
            },
            success: true,
            raw_text: Some(text),
            engine: "vision".to_string(),
        };
    }

    let has_tesseract = Command::new("which")
        .arg("tesseract")
        .status()
        .map(|status| status.success())
        .unwrap_or(false);

    if !has_tesseract {
        return OcrOutput {
            summary: "ocr_unavailable_local".to_string(),
            success: false,
            raw_text: None,
            engine: "unavailable".to_string(),
        };
    }

    let output = Command::new("tesseract")
        .arg(path.as_os_str())
        .arg("stdout")
        .arg("-l")
        .arg("eng")
        .output();

    match output {
        Ok(result) if result.status.success() => {
            let text = String::from_utf8_lossy(&result.stdout).to_string();
            let summary = concise_text(&text, 220);
            OcrOutput {
                summary: if summary.is_empty() {
                    "ocr_empty".to_string()
                } else {
                    summary
                },
                success: true,
                raw_text: Some(text),
                engine: "tesseract".to_string(),
            }
        }
        _ => OcrOutput {
            summary: "ocr_failed_local".to_string(),
            success: false,
            raw_text: None,
            engine: "failed".to_string(),
        },
    }
}

fn run_vision_ocr(path: &Path) -> Option<String> {
    let script = r#"
import Foundation
import Vision
import ImageIO

let args = CommandLine.arguments
if args.count < 2 {
    print("")
    exit(0)
}

let imagePath = args[1]
let imageURL = URL(fileURLWithPath: imagePath)
guard let source = CGImageSourceCreateWithURL(imageURL as CFURL, nil),
      let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
    print("")
    exit(0)
}

let request = VNRecognizeTextRequest()
request.recognitionLevel = .fast
let handler = VNImageRequestHandler(cgImage: image, options: [:])

do {
    try handler.perform([request])
    let results = (request.results as? [VNRecognizedTextObservation]) ?? []
    let text = results.compactMap { $0.topCandidates(1).first?.string }.joined(separator: " ")
    print(text)
} catch {
    print("")
}
"#;

    let output = Command::new("xcrun")
        .arg("swift")
        .arg("-e")
        .arg(script)
        .arg(path.as_os_str())
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if text.is_empty() {
        return None;
    }
    Some(text)
}
