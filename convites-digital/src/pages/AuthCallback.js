import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token   = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(decodeURIComponent(userStr));
        // Guardar em ambos para consistência com o login normal
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
        navigate("/home");
      } catch {
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh", background:"linear-gradient(135deg,#667eea,#764ba2)" }}>
      <div style={{ textAlign:"center", color:"white" }}>
        <div style={{ width:"48px", height:"48px", border:"3px solid rgba(255,255,255,0.3)", borderTopColor:"white", borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 20px" }}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ fontSize:"16px", opacity:0.9 }}>A autenticar...</p>
      </div>
    </div>
  );
}

export default AuthCallback;
