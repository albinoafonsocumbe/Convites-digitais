const fetch = require("node-fetch");

// Envia email via Brevo API (300 emails/dia gratis, sem restricao de destinatarios)
// Fallback para Resend se BREVO_API_KEY nao estiver configurada
const sendEmail = async ({ to, subject, html }) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (brevoKey) {
    const from = process.env.EMAIL_FROM_NAME || "Convites Digitais";
    const fromEmail = process.env.EMAIL_FROM_ADDRESS || "noreply@convitesdigitais.com";

    // Suporta tanto xkeysib- (API key) como xsmtpsib- (SMTP key — usa endpoint v2)
    const isSmtpKey = brevoKey.startsWith("xsmtpsib-");
    const endpoint = "https://api.brevo.com/v3/smtp/email";
    const authHeader = isSmtpKey ? { "api-key": brevoKey } : { "api-key": brevoKey };

    const resp = await fetch(endpoint, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: from, email: fromEmail },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message || JSON.stringify(data) || `Brevo erro ${resp.status}`);
    return { sucesso: true };
  }

  if (resendKey) {
    const from = process.env.EMAIL_FROM || "Convites Digitais <onboarding@resend.dev>";
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data.message || `Resend erro ${resp.status}`);
    return { sucesso: true };
  }

  console.log("⚠️  Nenhum servico de email configurado.");
  return { sucesso: false, erro: "Email nao configurado", isTest: true };
};

const templateConvite = ({ nomeEvento, data, local, mensagem, linkConvite, nomeAnfitriao }) => {
  const dataFormatada = new Date(data).toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"/><title>Convite - ${nomeEvento}</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr><td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Convites Digitais</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">Recebeu um convite</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#333;font-size:24px;margin:0 0 8px;">${nomeEvento}</h2>
          <p style="color:#666;font-size:15px;margin:0 0 24px;">${nomeAnfitriao} convidou-o para este evento especial.</p>
          ${mensagem ? `<div style="background:#f8f9ff;border-left:4px solid #667eea;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;"><p style="color:#555;font-size:15px;margin:0;font-style:italic;">"${mensagem}"</p></div>` : ""}
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td style="padding:12px 16px;background:#f8f9ff;border-radius:8px 8px 0 0;border-bottom:1px solid #e8ecff;">
              <span style="color:#667eea;font-weight:700;font-size:12px;text-transform:uppercase;">Data</span><br/>
              <span style="color:#333;font-size:15px;">${dataFormatada}</span>
            </td></tr>
            <tr><td style="padding:12px 16px;background:#f8f9ff;border-radius:0 0 8px 8px;">
              <span style="color:#667eea;font-weight:700;font-size:12px;text-transform:uppercase;">Local</span><br/>
              <span style="color:#333;font-size:15px;">${local}</span>
            </td></tr>
          </table>
          <div style="text-align:center;margin:28px 0;">
            <a href="${linkConvite}" style="display:inline-block;background:#667eea;color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;">Confirmar Presença</a>
          </div>
          <p style="color:#aaa;font-size:12px;text-align:center;margin:0;">Ou acesse: <a href="${linkConvite}" style="color:#667eea;">${linkConvite}</a></p>
        </td></tr>
        <tr><td style="background:#f8f9ff;padding:18px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#aaa;font-size:12px;margin:0;">Enviado via Convites Digitais</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

const templateConfirmacao = ({ nomeConvidado, nomeEvento, data, local, confirmado, linkConvite }) => {
  const dataFormatada = new Date(data).toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return `<!DOCTYPE html>
<html lang="pt"><head><meta charset="UTF-8"/><title>Confirmação</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#667eea;padding:32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">${confirmado ? "Presença Confirmada" : "Resposta Registada"}</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="color:#333;font-size:15px;">Olá, <strong>${nomeConvidado}</strong>.</p>
          <p style="color:#666;font-size:14px;">${confirmado ? `A sua presença em <strong>${nomeEvento}</strong> foi confirmada.` : `A sua resposta para <strong>${nomeEvento}</strong> foi registada.`}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border-radius:8px;margin:20px 0;">
            <tr><td style="padding:12px 16px;border-bottom:1px solid #e8ecff;"><span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase;">Evento</span><br/><span style="color:#333;">${nomeEvento}</span></td></tr>
            <tr><td style="padding:12px 16px;border-bottom:1px solid #e8ecff;"><span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase;">Data</span><br/><span style="color:#333;">${dataFormatada}</span></td></tr>
            <tr><td style="padding:12px 16px;"><span style="color:#667eea;font-size:11px;font-weight:700;text-transform:uppercase;">Local</span><br/><span style="color:#333;">${local}</span></td></tr>
          </table>
          ${confirmado ? `<div style="text-align:center;"><a href="${linkConvite}" style="display:inline-block;background:#667eea;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:700;">Ver Convite</a></div>` : ""}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
};

const enviarConvite = async ({ emails, evento, linkConvite, nomeAnfitriao }) => {
  const html = templateConvite({
    nomeEvento: evento.nome_evento,
    data: evento.data_evento,
    local: evento.local_evento,
    mensagem: evento.mensagem,
    linkConvite,
    nomeAnfitriao,
  });

  const resultados = await Promise.allSettled(
    emails.map(async (email) => {
      try {
        await sendEmail({ to: email.trim(), subject: `Convite: ${evento.nome_evento}`, html });
        console.log(`✅ Email enviado para: ${email}`);
        return { email, sucesso: true };
      } catch (err) {
        console.error(`❌ Falha para ${email}:`, err.message);
        return { email, sucesso: false, erro: err.message };
      }
    })
  );

  return {
    isTest: !process.env.RESEND_API_KEY,
    resultados: resultados.map(r => r.status === "fulfilled" ? r.value : { sucesso: false, erro: r.reason?.message }),
  };
};

const enviarConfirmacao = async ({ email, nomeConvidado, evento, confirmado, linkConvite }) => {
  if (!email) return;
  try {
    await sendEmail({
      to: email,
      subject: `${confirmado ? "Presença confirmada" : "Resposta registada"}: ${evento.nome_evento}`,
      html: templateConfirmacao({ nomeConvidado, nomeEvento: evento.nome_evento, data: evento.data_evento, local: evento.local_evento, confirmado, linkConvite }),
    });
    console.log(`✅ Confirmação enviada para: ${email}`);
  } catch (err) {
    console.error(`⚠️ Falha confirmação para ${email}:`, err.message);
  }
};

module.exports = { enviarConvite, enviarConfirmacao, enviarEmail: sendEmail };
