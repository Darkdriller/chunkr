import { Flex, Text } from "@radix-ui/themes";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Upload from "./Upload";
import "./UploadMain.css";
import { Model, UploadForm } from "../../models/upload.model";
import { uploadFile } from "../../services/uploadFileApi";

export default function UploadMain({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [model, setModel] = useState<Model>(Model.Fast);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile);
    setFileName(uploadedFile.name);
  };

  const handleFileRemove = () => {
    setFile(null);
    setFileName("");
  };

  const handleModelToggle = () => {
    setModel(model === Model.Fast ? Model.HighQuality : Model.Fast);
  };

  const handleRun = async () => {
    if (!file) {
      console.error("No file uploaded");
      return;
    }

    setIsLoading(true);
    setError(null);
    const payload: UploadForm = {
      file,
      model,
      target_chunk_length: 512,
    };

    try {
      const taskResponse = await uploadFile(payload);
      navigate(
        `/task/${taskResponse.task_id}?pageCount=${taskResponse.page_count}`
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <div
            style={{
              color: "var(--red-9)",
              padding: "8px 12px",
              border: "2px solid var(--red-12)",
              borderRadius: "4px",
              backgroundColor: "var(--red-7)",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--red-8)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--red-7)")
            }
          >
            {error}
          </div>
        </Link>
      </div>
    );
  }

  return (
    <Flex direction="column" width="100%" align="center">
      <Upload
        onFileUpload={handleFileUpload}
        onFileRemove={handleFileRemove}
        isUploaded={!!file}
        fileName={fileName}
        isAuthenticated={isAuthenticated}
      />
      {isAuthenticated && (
        <>
          <Flex
            direction="row"
            height="64px"
            width="100%"
            mt="8px"
            className="toggle-container"
            onClick={handleModelToggle}
          >
            <Flex
              direction="column"
              height="100%"
              justify="center"
              className={model === Model.Fast ? "toggle-active" : "toggle"}
              style={{
                borderTopLeftRadius: "4px",
                borderBottomLeftRadius: "4px",
              }}
            >
              <Text size="5" weight="medium">
                Fast
              </Text>
            </Flex>
            <Flex
              direction="column"
              height="100%"
              justify="center"
              className={
                model === Model.HighQuality ? "toggle-active" : "toggle"
              }
              style={{
                borderTopRightRadius: "4px",
                borderBottomRightRadius: "4px",
              }}
            >
              <Text size="5" weight="medium">
                High Quality
              </Text>
            </Flex>
          </Flex>
          <Flex direction="row" width="100%" mt="32px">
            <Flex
              direction="column"
              height="64px"
              justify="center"
              className={!!file && !isLoading ? "toggle-active" : "toggle"}
              style={{
                borderRadius: "4px",
                cursor: !!file && !isLoading ? "pointer" : "not-allowed",
              }}
              onClick={!!file && !isLoading ? handleRun : undefined}
            >
              <Text size="5" weight="medium">
                {isLoading ? "Uploading..." : "Run"}
              </Text>
            </Flex>
          </Flex>
        </>
      )}
    </Flex>
  );
}
