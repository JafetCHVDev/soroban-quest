import { useEffect, useRef } from "react";
import { createDebouncedValidator } from "../systems/liveValidator";

const LIVE_MARKER_OWNER = "soroban-quest-live";

export function useLiveValidation(code, mission, loading, setLivePassCount, setLiveTotalCount) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const validatorRef = useRef(null);

  useEffect(() => {
    const applyMonacoMarkers = (markers) => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (!monaco || !editor) return;
      const model = editor.getModel();
      if (!model) return;
      monaco.editor.setModelMarkers(model, LIVE_MARKER_OWNER, markers);
    };

    const clearMonacoMarkers = () => {
      const monaco = monacoRef.current;
      const editor = editorRef.current;
      if (!monaco || !editor) return;
      const model = editor.getModel();
      if (model) monaco.editor.setModelMarkers(model, LIVE_MARKER_OWNER, []);
    };

    const validator = createDebouncedValidator(500, (result) => {
      setLivePassCount(result.passCount);
      setLiveTotalCount(result.totalCount);
      applyMonacoMarkers(result.markers);
    });
    validatorRef.current = validator;
    
    return () => {
      validator.cancel();
      clearMonacoMarkers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLivePassCount, setLiveTotalCount]);

  useEffect(() => {
    if (!mission || loading) return;
    validatorRef.current?.call(code, mission);
  }, [code, mission, loading]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return { handleEditorMount };
}
