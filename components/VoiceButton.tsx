"use client";

import { useRef, useState } from "react";

type RecognitionWindow = Window & {
  webkitSpeechRecognition?: new () => {
    lang: string;
    start: () => void;
    onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
    onerror: () => void;
  };
};

type VoiceButtonProps = {
  onText: (text: string) => void;
  onStatus: (status: string) => void;
};

const YANDEX_MIME = "audio/ogg;codecs=opus";

export function VoiceButton({ onText, onStatus }: VoiceButtonProps) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  function useBrowserRecognition() {
    const Recognition = (window as RecognitionWindow).webkitSpeechRecognition;
    if (!Recognition) {
      onStatus("Голосовой ввод недоступен. Разрешите микрофон или введите текст вручную.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ru-RU";
    recognition.onresult = (event) => {
      onText(event.results[0][0].transcript);
      onStatus("Голос распознан. Проверьте текст перед отправкой.");
    };
    recognition.onerror = () => onStatus("Не удалось распознать голос. Введите текст вручную.");
    recognition.start();
    onStatus("Слушаю…");
  }

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported(YANDEX_MIME)) {
      useBrowserRecognition();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: YANDEX_MIME });
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audio = new Blob(chunksRef.current, { type: YANDEX_MIME });
        if (!audio.size) {
          onStatus("Не удалось записать звук. Попробуйте ещё раз.");
          return;
        }

        onStatus("Распознаю запись…");
        try {
          const response = await fetch("/api/stt", {
            method: "POST",
            headers: { "Content-Type": YANDEX_MIME },
            body: audio
          });
          const data = await response.json();
          if (!response.ok || !data.text) throw new Error(data.error ?? "STT request failed");
          onText(data.text);
          onStatus("Голос распознан. Проверьте текст перед отправкой.");
        } catch {
          onStatus("Не удалось распознать голос. Проверьте настройки Yandex STT или введите текст вручную.");
        }
      };
      recorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      onStatus("Слушаю… Нажмите ещё раз, чтобы остановить.");
    } catch {
      onStatus("Нет доступа к микрофону. Разрешите его в браузере или введите текст вручную.");
    }
  }

  function toggleRecording() {
    if (recording && recorderRef.current) {
      recorderRef.current.stop();
      recorderRef.current = null;
      setRecording(false);
      return;
    }
    void startRecording();
  }

  return (
    <button type="button" className="button ghost" onClick={toggleRecording} aria-label={recording ? "Остановить запись" : "Голосовой ввод"} aria-pressed={recording}>
      {recording ? "■" : "🎙"}
    </button>
  );
}
