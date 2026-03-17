const nodemailer = require("nodemailer");

// Criar transporter baseado na configuração disponível
const createTransporter = async () => {
  // Se não há credenciais reais configuradas, usa Ethereal (email de teste)
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  const isConfigured = emailUser && emailPass 
    && emailUser !== "seu_email@gmail.com" 
    && emailPass !== "sua_app_password_aqui";

  if (!isConfigured) {
    console.log("⚠️  Email real não configurado. Usando Ethereal (email de teste).");
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    return { transporter, isTest: true };
  }

  console.log(`📧 Usando Gmail: ${emailUser}`);
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: emailUser, pass: emailPass },
  });
  return { transporter, isTest: false };
};

// Template HTML do convite
const templateConvite = ({ nomeEvento, data, local, mensagem, linkConvite, nomeAnfitriao }) => {
  const dataFormatada = new Date(data).toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Convite - ${nomeEvento}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea,#764ba2);padding:40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                Convites Digitais
              </h1>
              <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:15px;">
                Você recebeu um convite
              </p>
            </td>
          </tr>

          <!-- Corpo -->
          <tr>
            <td style="padding:40px;">
              <h2 style="color:#333;font-size:24px;margin:0 0 8px;">${nomeEvento}</h2>
              <p style="color:#666;font-size:15px;margin:0 0 30px;">
                ${nomeAnfitriao} convidou-o para este evento especial.
              </p>

              ${mensagem ? `
              <div style="background:#f8f9ff;border-left:4px solid #667eea;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:30px;">
                <p style="color:#555;font-size:15px;margin:0;line-height:1.6;font-style:italic;">"${mensagem}"</p>
              </div>` : ""}

              <!-- Detalhes -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
                <tr>
                  <td style="padding:12px 16px;background:#f8f9ff;border-radius:8px 8px 0 0;border-bottom:1px solid #e8ecff;">
                    <span style="color:#667eea;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Data</span><br/>
                    <span style="color:#333;font-size:15px;">${dataFormatada}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8f9ff;border-radius:0 0 8px 8px;">
                    <span style="color:#667eea;font-weight:700;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Local</span><br/>
                    <span style="color:#333;font-size:15px;">${local}</span>
                  </td>
                </tr>
              </table>

              <!-- Botão -->
              <div style="text-align:center;margin:30px 0;">
                <a href="${linkConvite}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#ffffff;text-decoration:none;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                  Confirmar Presença
                </a>
              </div>

              <p style="color:#999;font-size:13px;text-align:center;margin:0;">
                Ou acesse o link: <a href="${linkConvite}" style="color:#667eea;">${linkConvite}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9ff;padding:20px;text-align:center;border-top:1px solid #eee;">
              <p style="color:#aaa;font-size:12px;margin:0;">
                Este convite foi enviado através do sistema Convites Digitais.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Enviar convite para um ou múltiplos emails
const enviarConvite = async ({ emails, evento, linkConvite, nomeAnfitriao }) => {
  const { transporter, isTest } = await createTransporter();

  const html = templateConvite({
    nomeEvento: evento.nome_evento,
    data: evento.data_evento,
    local: evento.local_evento,
    mensagem: evento.mensagem,
    linkConvite,
    nomeAnfitriao,
  });

  const resultados = [];

  for (const email of emails) {
    try {
      const info = await transporter.sendMail({
        from: `"Convites Digitais" <${process.env.EMAIL_USER || "noreply@convites.com"}>`,
        to: email.trim(),
        subject: `Convite: ${evento.nome_evento}`,
        html,
      });

      // Se for modo de teste, mostra o link de preview
      if (isTest) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log(`📧 Email de teste enviado para: ${email}`);
        console.log(`🔗 Ver email aqui: ${previewUrl}`);
        resultados.push({ email, sucesso: true, previewUrl });
      } else {
        console.log(`✅ Email enviado para: ${email}`);
        resultados.push({ email, sucesso: true });
      }
    } catch (err) {
      resultados.push({ email, sucesso: false, erro: err.message });
      console.error(`❌ Falha ao enviar para ${email}:`, err.message);
    }
  }

  return { resultados, isTest };
};

module.exports = { enviarConvite };

// Template de confirmação para o convidado
const templateConfirmacao = ({ nomeConvidado, nomeEvento, data, local, confirmado, linkConvite }) => {
  const dataFormatada = new Date(data).toLocaleDateString("pt-PT", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"/><title>Confirmação de Presença</title></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
        <tr>
          <td style="background:linear-gradient(135deg,${confirmado ? "#667eea,#764ba2" : "#f5576c,#f093fb"});padding:36px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">
              ${confirmado ? "Presença Confirmada" : "Resposta Registada"}
            </h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px;">
            <p style="color:#333;font-size:16px;margin:0 0 24px;">Olá, <strong>${nomeConvidado}</strong>.</p>
            <p style="color:#666;font-size:15px;margin:0 0 24px;">
              ${confirmado
                ? `A sua presença no evento <strong>${nomeEvento}</strong> foi confirmada com sucesso.`
                : `A sua resposta para o evento <strong>${nomeEvento}</strong> foi registada.`
              }
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9ff;border-radius:8px;overflow:hidden;margin-bottom:24px;">
              <tr><td style="padding:14px 18px;border-bottom:1px solid #e8ecff;">
                <span style="color:#667eea;font-size:12px;font-weight:700;text-transform:uppercase;">Evento</span><br/>
                <span style="color:#333;font-size:15px;">${nomeEvento}</span>
              </td></tr>
              <tr><td style="padding:14px 18px;border-bottom:1px solid #e8ecff;">
                <span style="color:#667eea;font-size:12px;font-weight:700;text-transform:uppercase;">Data</span><br/>
                <span style="color:#333;font-size:15px;">${dataFormatada}</span>
              </td></tr>
              <tr><td style="padding:14px 18px;">
                <span style="color:#667eea;font-size:12px;font-weight:700;text-transform:uppercase;">Local</span><br/>
                <span style="color:#333;font-size:15px;">${local}</span>
              </td></tr>
            </table>
            ${confirmado ? `
            <div style="text-align:center;">
              <a href="${linkConvite}" style="display:inline-block;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;">
                Ver Convite
              </a>
            </div>` : ""}
          </td>
        </tr>
        <tr>
          <td style="background:#f8f9ff;padding:18px;text-align:center;border-top:1px solid #eee;">
            <p style="color:#aaa;font-size:12px;margin:0;">Convites Digitais</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
};

// Enviar confirmação ao convidado
const enviarConfirmacao = async ({ email, nomeConvidado, evento, confirmado, linkConvite }) => {
  if (!email) return;

  try {
    const { transporter } = await createTransporter();
    await transporter.sendMail({
      from: `"Convites Digitais" <${process.env.EMAIL_USER || "noreply@convites.com"}>`,
      to: email,
      subject: `${confirmado ? "Presença confirmada" : "Resposta registada"}: ${evento.nome_evento}`,
      html: templateConfirmacao({ nomeConvidado, nomeEvento: evento.nome_evento, data: evento.data_evento, local: evento.local_evento, confirmado, linkConvite }),
    });
    console.log(`✅ Email de confirmação enviado para: ${email}`);
  } catch (err) {
    console.error(`⚠️ Falha ao enviar confirmação para ${email}:`, err.message);
    // Não lança erro — o RSVP foi registado mesmo que o email falhe
  }
};

module.exports = { enviarConvite, enviarConfirmacao };
