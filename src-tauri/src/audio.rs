use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use std::fs::File;
use std::io::BufWriter;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

// Wrapper to allow Stream to be Send.
// cpal::Stream is !Send on macOS (CoreAudio) but generally safe to move.
struct SendStream(#[allow(dead_code)] cpal::Stream);
unsafe impl Send for SendStream {}
unsafe impl Sync for SendStream {}

pub struct AudioRecorder {
    // We keep the stream alive by holding it here.
    #[allow(dead_code)]
    stream: Option<SendStream>,
    writer: Arc<Mutex<Option<hound::WavWriter<BufWriter<File>>>>>,
}

impl AudioRecorder {
    pub fn new() -> Self {
        Self {
            stream: None,
            writer: Arc::new(Mutex::new(None)),
        }
    }

    pub fn start(&mut self, output_path: PathBuf) -> Result<(), String> {
        let host = cpal::default_host();
        let device = host.default_input_device().ok_or("No input device available")?;
        let config = device.default_input_config().map_err(|e| e.to_string())?;

        let spec = hound::WavSpec {
            channels: config.channels(),
            sample_rate: config.sample_rate().0,
            bits_per_sample: 16,
            sample_format: hound::SampleFormat::Int,
        };

        let writer = hound::WavWriter::create(output_path, spec).map_err(|e| e.to_string())?;
        let writer_arc = Arc::new(Mutex::new(Some(writer)));
        let writer_clone = writer_arc.clone();

        let err_fn = |err| eprintln!("an error occurred on stream: {}", err);

        let stream = match config.sample_format() {
            cpal::SampleFormat::F32 => device.build_input_stream(
                &config.into(),
                move |data: &[f32], _: &_| {
                    if let Ok(mut guard) = writer_clone.lock() {
                        if let Some(writer) = guard.as_mut() {
                            for &sample in data {
                                // Convert f32 to i16
                                let sample = (sample.clamp(-1.0, 1.0) * i16::MAX as f32) as i16;
                                writer.write_sample(sample).ok();
                            }
                        }
                    }
                },
                err_fn,
                None, 
            ),
            _ => return Err("Only F32 sample format is currently supported for simplicity".to_string()),
        }.map_err(|e| e.to_string())?;

        stream.play().map_err(|e| e.to_string())?;
        self.stream = Some(SendStream(stream));
        self.writer = writer_arc;
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), String> {
        self.stream = None; // Dropping stream stops recording
        if let Ok(mut guard) = self.writer.lock() {
            if let Some(writer) = guard.take() {
                writer.finalize().map_err(|e| e.to_string())?;
            }
        }
        Ok(())
    }
}
