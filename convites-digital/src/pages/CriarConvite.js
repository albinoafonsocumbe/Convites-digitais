import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { convitesAPI, uploadAPI } from "../services/api";
import { getConviteShareUrl } from "../services/shareUrl";
import "../styles/global.css";
import "../styles/Pages.css";

const sec = { background: "white", borderRadius: "14px", padding: "24px", marginBottom: "20px", border: "1px solid #e8ecff", boxShadow: "0 2px 12px rgba(102,126,234,0.08)" };
const tit = { fontSize: "13px", fontWeight: "700", color: "#667eea", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px" };
const inp = { width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e0e0e0", fontSize: "14px", outline: "none", boxSizing: "border-box", background: "white", color: "#333", fontFamily: "inherit" };
const btn2 = { background: "#f0f4ff", border: "1px solid #c5cae9", borderRadius: "8px", color: "#667eea", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 600, fontFamily: "inherit" };
const btnRem = { background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: "8px", color: "#f5576c", padding: "9px 12px", cursor: "pointer", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", fontFamily: "inherit" };

function SlotFoto({ url, onUpload, onRemove, index }) {
  const [up, setUp] = useState(false);
  const ref = useRef();
  const handle = async (e) => {
    const f = e.target.files[0]; if (!f) return; setUp(true);
    try { const r = await uploadAPI.upload(f, "image"); onUpload(index, r.url); }
    catch (err) { alert("Erro: " + err.message); }
    setUp(false);
  };
  if (url) return (
    <div style={{ position: "relative", aspectRatio: "1", borderRadius: "10px", overflow: "hidden" }}>
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <button type="button" onClick={() => onRemove(index)} style={{ position: "absolute", top: "6px", right: "6px", background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", color: "white", width: "26px", height: "26px", cursor: "pointer" }}>x</button>
    </div>
  );
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", aspectRatio: "1", borderRadius: "10px", border: "2px dashed #c5cae9", background: "#f8f9ff", cursor: up ? "wait" : "pointer" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#667eea"} onMouseLeave={e => e.currentTarget.style.borderColor = "#c5cae9"}>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={handle} />
      {up ? <span>⏳</span> : <><span style={{ fontSize: "24px" }}>+</span><span style={{ fontSize: "11px", color: "#999" }}>Foto</span></>}
    </label>
  );
}

function CriarConvite() {
  const navigate = useNavigate();
  const musicaRef = useRef(); const capaRef = useRef();
  const [form, setForm] = useState({
    titulo: "", descricao: "", data: "", local: "", hora_evento: "",
    musica_url: "", videos_urls: [], fotos: [], foto_capa: "", endereco_maps: ""
  });
  const [programa, setPrograma] = useState([{ hora: "", nome: "", local_prog: "", responsavel: "", descricao: "" }]);
  const [refeicao, setRefeicao] = useState({ pratos: [{ nome: "", descricao: "" }], bebidas: [{ nome: "", descricao: "" }] });
  const [convidados, setConvidados] = useState([{ nome: "", relacao: "" }]);
  const [upMusica, setUpMusica] = useState(false);
  const [upVideos, setUpVideos] = useState([]);
  const [videoProgress, setVideoProgress] = useState([]);
  const [upCapa, setUpCapa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [eventoId, setEventoId] = useState(null);

  const ch = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMusica = async (e) => {
    const f = e.target.files[0]; if (!f) return; setUpMusica(true);
    try { const r = await uploadAPI.upload(f, "video"); setForm(p => ({ ...p, musica_url: r.url })); }
    catch (err) { alert("Erro musica: " + err.message); }
    finally { setUpMusica(false); }
  };
  const handleCapa = async (e) => {
    const f = e.target.files[0]; if (!f) return; setUpCapa(true);
    try { const r = await uploadAPI.upload(f, "image"); setForm(p => ({ ...p, foto_capa: r.url })); }
    catch (err) { alert("Erro capa: " + err.message); } setUpCapa(false);
  };

  const addProg = () => setPrograma(p => [...p, { hora: "", nome: "", local_prog: "", responsavel: "", descricao: "" }]);
  const remProg = (i) => setPrograma(p => p.filter((_, x) => x !== i));
  const updProg = (i, k, v) => { const n = [...programa]; n[i][k] = v; setPrograma(n); };

  const addPrato = () => setRefeicao(r => ({ ...r, pratos: [...r.pratos, { nome: "", descricao: "" }] }));
  const remPrato = (i) => setRefeicao(r => ({ ...r, pratos: r.pratos.filter((_, x) => x !== i) }));
  const updPrato = (i, k, v) => { const n = [...refeicao.pratos]; n[i][k] = v; setRefeicao(r => ({ ...r, pratos: n })); };

  const addBebida = () => setRefeicao(r => ({ ...r, bebidas: [...r.bebidas, { nome: "", descricao: "" }] }));
  const remBebida = (i) => setRefeicao(r => ({ ...r, bebidas: r.bebidas.filter((_, x) => x !== i) }));
  const updBebida = (i, k, v) => { const n = [...refeicao.bebidas]; n[i][k] = v; setRefeicao(r => ({ ...r, bebidas: n })); };

  const addConv = () => setConvidados(c => [...c, { nome: "", relacao: "" }]);
  const remConv = (i) => setConvidados(c => c.filter((_, x) => x !== i));
  const updConv = (i, k, v) => { const n = [...convidados]; n[i][k] = v; setConvidados(n); };

  const gerarLink = (id, c) => {
    return getConviteShareUrl(id, { nome: c.nome, rel: c.relacao });
  };
  const copiar = (l) => { navigator.clipboard.writeText(l); alert("Copiado!"); };

  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const videosValidos = form.videos_urls.filter(v => v.trim());
      const ev = await convitesAPI.criar({ ...form, videos_urls: videosValidos, video_url: videosValidos[0] || "", programa, refeicao });
      setEventoId(ev.id); setMsg("Convite criado!");
    } catch (err) { setMsg("Erro: " + err.message); setLoading(false); }
  };

  const convValidos = convidados.filter(c => c.nome.trim());

  return (
    <div className="page-container">
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <h1 className="page-title">Criar Convite</h1>
          <p style={{ color: "white", opacity: 0.8, fontSize: "15px" }}>Personaliza cada detalhe do teu evento</p>
        </div>
        <div style={{ background: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
          {!eventoId ? (
            <form onSubmit={submit}>

              {/* INFORMACOES BASICAS */}
              <div style={sec}>
                <p style={tit}>📋 Informacoes do Evento</p>
                <div className="form-group">
                  <label>Titulo *</label>
                  <input style={inp} type="text" name="titulo" value={form.titulo} onChange={ch} required placeholder="Ex: Casamento de Ana & Joao" />
                </div>
                <div className="form-group">
                  <label>Mensagem para os convidados</label>
                  <textarea style={{ ...inp, resize: "vertical" }} name="descricao" value={form.descricao} onChange={ch} rows="3" placeholder="Uma mensagem especial..." />
                </div>
                <div className="grid-3col">
                  <div className="form-group">
                    <label>Data *</label>
                    <input style={inp} type="date" name="data" value={form.data} onChange={ch} required min={new Date().toISOString().split("T")[0]} />
                  </div>
                  <div className="form-group">
                    <label>Hora</label>
                    <input style={inp} type="time" name="hora_evento" value={form.hora_evento} onChange={ch} />
                  </div>
                  <div className="form-group">
                    <label>Local *</label>
                    <input style={inp} type="text" name="local" value={form.local} onChange={ch} required placeholder="Nome do local" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Endereco para Google Maps</label>
                  <input style={inp} type="text" name="endereco_maps" value={form.endereco_maps} onChange={ch} placeholder="Ex: Salao Stop, Maputo, Mozambique" />
                  <small style={{ color: "#999" }}>Sera usado para mostrar o mapa no convite</small>
                </div>
              </div>

              {/* FOTO DE CAPA */}
              <div style={sec}>
                <p style={tit}>🖼️ Foto de Capa</p>
                <input ref={capaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleCapa} />
                {form.foto_capa ? (
                  <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", maxHeight: "200px" }}>
                    <img src={form.foto_capa} alt="capa" style={{ width: "100%", height: "200px", objectFit: "cover" }} />
                    <button type="button" onClick={() => setForm(p => ({ ...p, foto_capa: "" }))} style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(0,0,0,0.6)", border: "none", color: "white", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>Remover</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => capaRef.current.click()} disabled={upCapa}
                    style={{ width: "100%", padding: "32px", border: "2px dashed #c5cae9", borderRadius: "12px", background: "#f8f9ff", cursor: upCapa ? "wait" : "pointer", color: "#667eea", fontSize: "15px", fontWeight: 600, fontFamily: "inherit" }}>
                    {upCapa ? "⏳ A fazer upload..." : "📷 Escolher foto de capa"}
                  </button>
                )}
                <small style={{ color: "#999", marginTop: "8px", display: "block" }}>
                  <div className="url-inline">
                    <span>Ou cola URL:</span>
                    <input style={{ border: "none", borderBottom: "1px solid #ddd", outline: "none", fontSize: "13px", padding: "2px 4px" }} type="url" name="foto_capa" value={form.foto_capa} onChange={ch} placeholder="https://..." />
                  </div>
                </small>
              </div>

              {/* MUSICA */}
              <div style={sec}>
                <p style={tit}>🎵 Musica de Fundo</p>
                <input ref={musicaRef} type="file" accept="audio/*" style={{ display: "none" }} onChange={handleMusica} />
                {form.musica_url ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f0f4ff", borderRadius: "10px", padding: "12px 16px" }}>
                    <audio controls src={form.musica_url} style={{ flex: 1, height: "36px" }} />
                    <button type="button" onClick={() => setForm(p => ({ ...p, musica_url: "" }))} style={{ ...btn2, color: "#f5576c", background: "#fff0f0", border: "1px solid #ffcdd2" }}>Remover</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => musicaRef.current.click()} disabled={upMusica}
                    style={{ width: "100%", padding: "18px", border: "2px dashed #c5cae9", borderRadius: "10px", background: "#f8f9ff", cursor: upMusica ? "wait" : "pointer", color: "#667eea", fontSize: "14px", fontWeight: 600 }}>
                    {upMusica ? "A fazer upload..." : "Escolher ficheiro de musica (MP3, WAV...)"}
                  </button>
                )}
                <small style={{ color: "#999", marginTop: "8px", display: "block" }}>
                  <div className="url-inline">
                    <span>Ou link direto:</span>
                    <input style={{ border: "none", borderBottom: "1px solid #ddd", outline: "none", fontSize: "13px", padding: "2px 4px" }} type="url" name="musica_url" value={form.musica_url} onChange={ch} placeholder="https://..." />
                  </div>
                </small>
              </div>

              {/* VIDEO */}
              <div style={sec}>
                <p style={tit}>🎬 Videos / Reels</p>
                <small style={{ color: "#999", display: "block", marginBottom: "14px" }}>Adiciona até 5 vídeos — serão exibidos num único slide com galeria. Suporta upload ou link YouTube/Vimeo.</small>
                {form.videos_urls.length > 0 && (
                  <div style={{ display: "flex", gap: "6px", marginBottom: "14px", flexWrap: "wrap" }}>
                    {form.videos_urls.map((v, i) => {
                      const yt = v.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
                      const thumb = yt ? "https://img.youtube.com/vi/" + yt[1] + "/mqdefault.jpg" : null;
                      return (
                        <div key={i} style={{ position: "relative", width: "80px", height: "56px", borderRadius: "8px", overflow: "hidden", border: "2px solid #c5cae9", background: "#f0f4ff" }}>
                          {thumb
                            ? <img src={thumb} alt={"Vídeo " + (i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#667eea", fontSize: "20px" }}>▶</div>
                          }
                          <div style={{ position: "absolute", bottom: "2px", left: "4px", background: "rgba(0,0,0,0.6)", borderRadius: "4px", padding: "1px 5px", color: "white", fontSize: "9px", fontWeight: 700 }}>{i + 1}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {form.videos_urls.map((v, i) => (
                  <div key={i} style={{ background: "white", borderRadius: "10px", padding: "14px", marginBottom: "10px", border: "1px solid #e8ecff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 700, color: "#667eea" }}>Vídeo {i + 1}</span>
                      <button type="button" onClick={() => setForm(p => ({ ...p, videos_urls: p.videos_urls.filter((_, x) => x !== i) }))}
                        style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: "6px", color: "#f5576c", padding: "4px 10px", cursor: "pointer", fontSize: "12px" }}>Remover</button>
                    </div>
                    {v && (v.includes("youtube") || v.includes("youtu.be") || v.includes("vimeo")) ? (
                      <div style={{ background: "#f0f4ff", borderRadius: "8px", padding: "10px 14px", fontSize: "13px", color: "#667eea", wordBreak: "break-all" }}>🔗 {v}</div>
                    ) : v ? (
                      <video controls src={v} style={{ width: "100%", borderRadius: "8px", maxHeight: "180px" }} />
                    ) : null}
                    <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                      <input style={{ ...inp, flex: 1, fontSize: "13px" }} type="url" value={v} onChange={e => { const n = [...form.videos_urls]; n[i] = e.target.value; setForm(p => ({ ...p, videos_urls: n })); }} placeholder="https://youtube.com/... ou https://vimeo.com/..." />
                      <label style={{ background: "#f0f4ff", border: "1px solid #c5cae9", borderRadius: "8px", color: "#667eea", padding: "8px 12px", cursor: upVideos[i] ? "wait" : "pointer", fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center" }}>
                        <input type="file" accept="video/*" style={{ display: "none" }} onChange={async (e) => {
                          const f = e.target.files[0]; if (!f) return;
                          setUpVideos(prev => { const n = [...prev]; n[i] = true; return n; });
                          setVideoProgress(prev => { const n = [...prev]; n[i] = 0; return n; });
                          try {
                            const r = await uploadAPI.upload(f, "video", (pct) => {
                              setVideoProgress(prev => { const n = [...prev]; n[i] = pct; return n; });
                            });
                            const n = [...form.videos_urls]; n[i] = r.url; setForm(p => ({ ...p, videos_urls: n }));
                          }
                          catch (err) { alert("Erro: " + err.message); }
                          finally {
                            setUpVideos(prev => { const n = [...prev]; n[i] = false; return n; });
                            setVideoProgress(prev => { const n = [...prev]; n[i] = 0; return n; });
                          }
                        }} />
                      {upVideos[i] ? `${videoProgress[i] > 0 ? videoProgress[i] + "%" : "A enviar..."}` : "Upload"}
                      </label>
                    </div>
                  </div>
                ))}
                {form.videos_urls.length < 5 && (
                  <button type="button" onClick={() => setForm(p => ({ ...p, videos_urls: [...p.videos_urls, ""] }))} style={btn2}>+ Adicionar vídeo</button>
                )}
              </div>

              {/* FOTOS */}
              <div style={sec}>
                <p style={tit}>📸 Galeria de Fotos</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px" }}>
                  {form.fotos.map((f, i) => (
                    <SlotFoto key={i} url={f} index={i}
                      onUpload={(idx, url) => { const n = [...form.fotos]; n[idx] = url; setForm(p => ({ ...p, fotos: n })); }}
                      onRemove={(idx) => setForm(p => ({ ...p, fotos: p.fotos.filter((_, x) => x !== idx) }))} />
                  ))}
                  <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", aspectRatio: "1", borderRadius: "10px", border: "2px dashed #c5cae9", background: "#f8f9ff", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#667eea"} onMouseLeave={e => e.currentTarget.style.borderColor = "#c5cae9"}
                    onClick={() => setForm(p => ({ ...p, fotos: [...p.fotos, ""] }))}>
                    <span style={{ fontSize: "24px", color: "#667eea" }}>+</span>
                    <span style={{ fontSize: "11px", color: "#999" }}>Adicionar</span>
                  </label>
                </div>
              </div>

              {/* PROGRAMA */}
              <div style={sec}>
                <p style={tit}>📅 Programa da Cerimonia</p>
                <small style={{ color: "#999", display: "block", marginBottom: "16px" }}>Adiciona cada momento do evento com hora, local e responsavel</small>
                {programa.map((p, i) => (
                  <div key={i} style={{ background: "white", borderRadius: "10px", padding: "14px", marginBottom: "12px", border: "1px solid #e8ecff" }}>
                    <div className="grid-prog">
                      <div>
                        <label style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>Hora</label>
                        <input style={inp} type="time" value={p.hora} onChange={e => updProg(i, "hora", e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>Nome do momento *</label>
                        <input style={inp} type="text" value={p.nome} onChange={e => updProg(i, "nome", e.target.value)} placeholder="Ex: Assinatura civil" />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>Local</label>
                        <input style={inp} type="text" value={p.local_prog} onChange={e => updProg(i, "local_prog", e.target.value)} placeholder="Ex: Registo - Maxixe" />
                      </div>
                    </div>
                    <div className="grid-prog2">
                      <div>
                        <label style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>Responsavel</label>
                        <input style={inp} type="text" value={p.responsavel} onChange={e => updProg(i, "responsavel", e.target.value)} placeholder="Ex: Conservador" />
                      </div>
                      <div>
                        <label style={{ fontSize: "12px", color: "#667eea", fontWeight: 600 }}>Descricao</label>
                        <input style={inp} type="text" value={p.descricao} onChange={e => updProg(i, "descricao", e.target.value)} placeholder="Breve descricao..." />
                      </div>
                      <button type="button" onClick={() => remProg(i)} style={{ ...btnRem, alignSelf: "flex-end" }}>Remover</button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addProg} style={btn2}>+ Adicionar momento</button>
              </div>

              {/* REFEICAO */}
              <div style={sec}>
                <p style={tit}>🍽️ Refeicao & Bebidas</p>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "10px" }}>Pratos</p>
                {refeicao.pratos.map((p, i) => (
                  <div key={i} className="grid-row-auto">
                    <input style={inp} type="text" value={p.nome} onChange={e => updPrato(i, "nome", e.target.value)} placeholder="Nome do prato" />
                    <input style={inp} type="text" value={p.descricao} onChange={e => updPrato(i, "descricao", e.target.value)} placeholder="Ingredientes / descricao" />
                    <button type="button" onClick={() => remPrato(i)} style={btnRem}>Remover</button>
                  </div>
                ))}
                <button type="button" onClick={addPrato} style={{ ...btn2, marginBottom: "16px" }}>+ Adicionar prato</button>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#333", marginBottom: "10px", marginTop: "8px" }}>Bebidas</p>
                {refeicao.bebidas.map((b, i) => (
                  <div key={i} className="grid-row-auto">
                    <input style={inp} type="text" value={b.nome} onChange={e => updBebida(i, "nome", e.target.value)} placeholder="Nome da bebida" />
                    <input style={inp} type="text" value={b.descricao} onChange={e => updBebida(i, "descricao", e.target.value)} placeholder="Marcas / descricao" />
                    <button type="button" onClick={() => remBebida(i)} style={btnRem}>Remover</button>
                  </div>
                ))}
                <button type="button" onClick={addBebida} style={btn2}>+ Adicionar bebida</button>
              </div>

              {/* CONVIDADOS */}
              <div style={sec}>
                <p style={tit}>👥 Lista de Convidados</p>
                <small style={{ color: "#999", display: "block", marginBottom: "14px" }}>Gera links personalizados para cada convidado</small>
                {convidados.map((c, i) => (
                  <div key={i} className="grid-row-auto">
                    <input style={inp} type="text" placeholder="Nome do convidado" value={c.nome} onChange={e => updConv(i, "nome", e.target.value)} />
                    <input style={inp} type="text" placeholder="Relacao (ex: Primo, Amigo)" value={c.relacao} onChange={e => updConv(i, "relacao", e.target.value)} />
                    <button type="button" onClick={() => remConv(i)} style={btnRem}>Remover</button>
                  </div>
                ))}
                <button type="button" onClick={addConv} style={btn2}>+ Adicionar convidado</button>
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: "100%", fontSize: "16px", padding: "14px" }}>
                {loading ? "A criar convite..." : "Criar Convite"}
              </button>
            </form>
          ) : (
            <div>
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg,#43e97b,#38f9d7)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: "32px" }}>✓</div>
                <h2 style={{ color: "#333", fontSize: "22px", marginBottom: "8px" }}>Convite criado!</h2>
                <p style={{ color: "#666" }}>Partilha os links com os teus convidados</p>
              </div>
              <div style={{ background: "#f8f9ff", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #e8ecff" }}>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "#667eea", marginBottom: "8px" }}>Link geral</p>
                <div style={{ display: "flex", gap: "10px" }}>
                  <input readOnly value={getConviteShareUrl(eventoId)} style={{ flex: 1, ...inp, background: "white" }} />
                  <button type="button" onClick={() => copiar(getConviteShareUrl(eventoId))} style={{ background: "#667eea", color: "white", border: "none", borderRadius: "8px", padding: "10px 16px", cursor: "pointer", fontWeight: 600 }}>Copiar</button>
                </div>
              </div>
              {convValidos.length > 0 && (
                <div>
                  <p style={{ fontSize: "14px", fontWeight: 700, color: "#333", marginBottom: "12px" }}>Links personalizados:</p>
                  {convValidos.map((c, i) => {
                    const link = gerarLink(eventoId, c);
                    return (
                      <div key={i} style={{ background: "#f8f9ff", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", border: "1px solid #e8ecff" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                          <span style={{ fontWeight: 700, color: "#333", fontSize: "14px" }}>{c.relacao ? c.relacao + " " : ""}{c.nome}</span>
                          <button type="button" onClick={() => copiar(link)} style={{ background: "#667eea", color: "white", border: "none", borderRadius: "6px", padding: "5px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>Copiar</button>
                        </div>
                        <input readOnly value={link} style={{ width: "100%", ...inp, fontSize: "12px", color: "#888", background: "white" }} />
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button onClick={() => navigate("/evento/" + eventoId)} className="btn btn-primary" style={{ flex: 1 }}>Ver Detalhes</button>
                <button onClick={() => navigate("/meus-convites")} className="btn" style={{ flex: 1, background: "#f0f4ff", color: "#667eea", border: "1px solid #c5cae9" }}>Meus Convites</button>
              </div>
            </div>
          )}
          {msg && !eventoId && <div className={msg.includes("Erro") ? "alert alert-error" : "alert alert-success"} style={{ marginTop: "20px", textAlign: "center" }}>{msg}</div>}
        </div>
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button onClick={() => navigate("/meus-convites")} className="btn" style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "2px solid white" }}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

export default CriarConvite;
