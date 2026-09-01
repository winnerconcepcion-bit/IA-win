import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Square, BookOpen, FlaskConical, Sigma, Languages } from "lucide-react";

const SUBJECTS = [
  { id: "general", label: "General", icon: BookOpen, system: "Eres un tutor educativo general para estudiantes de secundaria y preparatoria." },
  { id: "matematicas", label: "Matemáticas", icon: Sigma, system: "Eres un tutor de matemáticas. Resuelve problemas paso a paso, mostrando cada operación con claridad." },
  { id: "ciencias", label: "Ciencias", icon: FlaskConical, system: "Eres un tutor de ciencias (física, química, biología). Explica los conceptos con ejemplos concretos." },
  { id: "lenguaje", label: "Lenguaje", icon: Languages, system: "Eres un tutor de lenguaje y literatura. Ayuda con gramática, redacción, análisis de textos y comprensión lectora." },
];

const COLORS = {
  paper: "#EEF1EE",
  paperLine: "#C9D2CC",
  ink: "#16233D",
  inkSoft: "#3C4A63",
  accent: "#F4B93E",
  card: "#FBFAF6",
  danger: "#B23A2E",
};

export default function Cuaderno() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const scrollRef = useRef(null);

  const thread = messages[subject.id] || [];

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSpeechSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = "es-DO";
    rec.interimResults = true;
    rec.continuous = false;
    rec.onresult = (e) => {
      let text = "";
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript;
      }
      setInput(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setInput("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const sendQuestion = async () => {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    const history = thread.concat([{ role: "user", content: question }]);
    setMessages((prev) => ({ ...prev, [subject.id]: history }));
    setLoading(true);

    try {
      const apiMessages = history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      // Llama a NUESTRO backend (api/ask.js), que a su vez llama a Anthropic
      // con la clave guardada de forma segura en el servidor.
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system:
            subject.system +
            " Responde en español, de forma clara y breve pero completa. Explica el razonamiento paso a paso para que el estudiante aprenda a resolverlo por su cuenta, no le des solo la respuesta final sin explicación. Usa un tono cercano y alentador.",
          messages: apiMessages,
        }),
      });
      const data = await response.json();
      const text = (data.content || [])
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("\n")
        .trim() || "No pude generar una respuesta. Intenta de nuevo.";

      setMessages((prev) => ({
        ...prev,
        [subject.id]: prev[subject.id].concat([{ role: "assistant", content: text }]),
      }));
    } catch (err) {
      setMessages((prev) => ({
        ...prev,
        [subject.id]: prev[subject.id].concat([
          { role: "assistant", content: "Hubo un problema de conexión. Intenta de nuevo en un momento.", error: true },
        ]),
      }));
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.paper,
        backgroundImage: `repeating-linear-gradient(${COLORS.paperLine} 0 1px, transparent 1px 34px)`,
        backgroundPositionY: "88px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: COLORS.ink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "28px 16px 40px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .subj-btn:focus-visible, .icon-btn:focus-visible, .send-btn:focus-visible {
          outline: 2px solid ${COLORS.ink};
          outline-offset: 2px;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse { animation: none !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>

      <div style={{ width: "100%", maxWidth: 640 }}>
        <div style={{ marginBottom: 22 }}>
          <h1
            style={{
              fontFamily: "'Fraunces', serif",
              fontWeight: 600,
              fontSize: 40,
              lineHeight: 1.05,
              margin: 0,
              color: COLORS.ink,
            }}
          >
            Cuaderno
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 15, color: COLORS.inkSoft, maxWidth: 420 }}>
            Escribe o dicta tu pregunta de tarea y recibe una explicación paso a paso, no solo la respuesta.
          </p>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 0 }}>
          {SUBJECTS.map((s) => {
            const Icon = s.icon;
            const active = s.id === subject.id;
            return (
              <button
                key={s.id}
                className="subj-btn"
                onClick={() => setSubject(s)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: "10px 6px",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  color: active ? COLORS.ink : COLORS.inkSoft,
                  background: active ? COLORS.card : "transparent",
                  border: "none",
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  borderBottom: active ? "none" : `1px solid ${COLORS.paperLine}`,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <Icon size={15} strokeWidth={2} />
                {s.label}
              </button>
            );
          })}
        </div>

        <div
          style={{
            background: COLORS.card,
            borderRadius: "0 10px 10px 10px",
            boxShadow: "0 1px 0 rgba(22,35,61,0.06), 0 8px 24px rgba(22,35,61,0.06)",
            overflow: "hidden",
          }}
        >
          <div
            ref={scrollRef}
            style={{
              height: 380,
              overflowY: "auto",
              padding: "20px 20px 8px",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {thread.length === 0 && (
              <div style={{ margin: "auto", textAlign: "center", color: COLORS.inkSoft, fontSize: 14, maxWidth: 320 }}>
                Aún no hay preguntas en {subject.label.toLowerCase()}. Escribe abajo o toca el micrófono para dictar.
              </div>
            )}
            {thread.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "84%",
                  background: m.role === "user" ? COLORS.ink : "transparent",
                  color: m.role === "user" ? COLORS.card : m.error ? COLORS.danger : COLORS.ink,
                  padding: m.role === "user" ? "10px 14px" : "0",
                  borderRadius: m.role === "user" ? 14 : 0,
                  borderLeft: m.role === "assistant" ? `3px solid ${COLORS.accent}` : "none",
                  paddingLeft: m.role === "assistant" ? 12 : 14,
                  fontSize: 14.5,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: "flex-start", display: "flex", gap: 5, paddingLeft: 12, borderLeft: `3px solid ${COLORS.accent}` }}>
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.inkSoft, animation: "pulse 1.2s ease-in-out infinite" }} />
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.inkSoft, animation: "pulse 1.2s ease-in-out 0.15s infinite" }} />
                <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.inkSoft, animation: "pulse 1.2s ease-in-out 0.3s infinite" }} />
              </div>
            )}
          </div>

          <div
            style={{
              borderTop: `1px solid ${COLORS.paperLine}`,
              padding: 12,
              display: "flex",
              alignItems: "flex-end",
              gap: 8,
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={listening ? "Escuchando..." : "Escribe tu pregunta..."}
              rows={1}
              style={{
                flex: 1,
                resize: "none",
                border: "none",
                background: "transparent",
                fontFamily: "inherit",
                fontSize: 14.5,
                color: COLORS.ink,
                padding: "8px 6px",
                maxHeight: 90,
              }}
            />
            {speechSupported && (
              <button
                className="icon-btn"
                onClick={toggleListening}
                aria-label={listening ? "Detener dictado" : "Dictar pregunta"}
                style={{
                  flexShrink: 0,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  border: "none",
                  background: listening ? COLORS.danger : COLORS.paper,
                  color: listening ? "#fff" : COLORS.ink,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                {listening ? <Square size={15} /> : <Mic size={17} />}
              </button>
            )}
            <button
              className="send-btn"
              onClick={sendQuestion}
              disabled={!input.trim() || loading}
              aria-label="Enviar pregunta"
              style={{
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                background: !input.trim() || loading ? COLORS.paperLine : COLORS.accent,
                color: COLORS.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: !input.trim() || loading ? "default" : "pointer",
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        <p style={{ marginTop: 14, fontSize: 12.5, color: COLORS.inkSoft, textAlign: "center" }}>
          Pensado para practicar y entender, no para usarse durante un examen real.
        </p>
      </div>
    </div>
  );
}
