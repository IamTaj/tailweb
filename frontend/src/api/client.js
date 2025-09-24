export function authHeaders() {
    const token = sessionStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  
  export async function api(path, options = {}) {
    const res = await fetch(`http://localhost:8000${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
        ...(options.headers || {})
      },
      ...options
    })
    if (!res.ok) {
      if (res.status === 401) {
        try {
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
        } catch {}
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      }
      let msg = 'Request failed';
      try { const j = await res.json(); msg = j.message || msg; } catch {}
      throw new Error(msg);
    }
    try { return await res.json(); } catch { return {}; }
  }