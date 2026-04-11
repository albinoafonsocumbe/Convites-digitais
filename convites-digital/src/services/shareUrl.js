// URL base para links de partilha de convites.
// Em produção aponta para o backend (que serve meta tags SEO para crawlers)
// e redireciona utilizadores para o frontend React.
const SHARE_BASE = process.env.REACT_APP_SHARE_URL || window.location.origin;

export const getConviteShareUrl = (id, params = {}) => {
  const url = new URL(`${SHARE_BASE}/convite/${id}`);
  Object.entries(params).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });
  return url.toString();
};
