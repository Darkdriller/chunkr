use actix_multipart::form::{tempfile::TempFile, text::Text, MultipartForm};
use postgres_types::{FromSql, ToSql};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use strum_macros::{Display, EnumString};
use utoipa::ToSchema;

#[derive(Debug, MultipartForm, ToSchema)]
pub struct UploadForm {
    #[schema(value_type = String, format = "binary")]
    pub file: TempFile,
    #[schema(value_type = Model)]
    pub model: Text<Model>,
    #[schema(value_type = Option<i32>)]
    pub target_chunk_length: Option<Text<i32>>,
    #[schema(value_type = Option<OcrStrategy>, default = OcrStrategy::default)]
    pub ocr_strategy: Option<Text<OcrStrategy>>,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema)]
pub struct ExtractionPayload {
    pub model: SegmentationModel,
    pub input_location: String,
    pub output_location: String,
    pub image_folder_location: String,
    pub task_id: String,
    pub batch_size: Option<i32>,
    #[serde(with = "humantime_serde")]
    pub expiration: Option<Duration>,
    pub target_chunk_length: Option<i32>,
    pub configuration: Configuration,
}

#[derive(
    Serialize, Deserialize, Debug, Clone, Display, EnumString, Eq, PartialEq, ToSql, FromSql,
)]
pub enum SegmentationModel {
    PdlaFast,
    Pdla,
}

#[derive(Serialize, Deserialize, Debug, Clone, ToSchema, ToSql, FromSql)]
pub enum Model {
    Fast,
    HighQuality,
}

#[derive(Debug, Serialize, Deserialize, Clone, ToSql, FromSql, ToSchema)]
pub struct Configuration {
    pub model: Model,
    pub ocr_strategy: OcrStrategy,
    pub target_chunk_length: Option<i32>,
}

impl Model {
    pub fn to_internal(&self) -> SegmentationModel {
        match self {
            Model::Fast => SegmentationModel::PdlaFast,
            Model::HighQuality => SegmentationModel::Pdla,
        }
    }
}

impl SegmentationModel {
    pub fn to_external(&self) -> Model {
        match self {
            SegmentationModel::PdlaFast => Model::Fast,
            SegmentationModel::Pdla => Model::HighQuality,
        }
    }

    pub fn get_extension(&self) -> &str {
        match self {
            SegmentationModel::PdlaFast => "json",
            SegmentationModel::Pdla => "json",
        }
    }
}


#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, ToSql, FromSql, ToSchema, Display, EnumString)]
pub enum OcrStrategy {
    Auto,
    All,
    Off,
}

impl Default for OcrStrategy {
    fn default() -> Self {
        OcrStrategy::Auto
    }
}
