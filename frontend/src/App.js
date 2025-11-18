import React, {useState, useEffect} from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API || 'http://localhost:4000';

function authHeaders(token){ return { headers: { Authorization: 'Bearer ' + token } } }

function App(){
  const [token, setToken] = useState(localStorage.getItem('token')||'');
  const [view, setView] = useState(token?'dashboard':'auth');

  useEffect(()=>{ if (token) localStorage.setItem('token', token); else localStorage.removeItem('token'); }, [token]);

  return (
    <div className="app">
      <header><h1>Shock Beatzs - Store</h1></header>
      <main>
        {view==='auth' && <Auth onLogin={(t)=>{setToken(t); setView('dashboard')}} api={API} />}
        {view==='dashboard' && <Dashboard token={token} api={API} onLogout={()=>{setToken(''); setView('auth')}} />}
      </main>
      <footer>© 2025 Shock Beatzs</footer>
    </div>
  );
}

function Auth({onLogin, api}){
  const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[mode,setMode]=useState('login'),[err,setErr]=useState('');
  async function submit(e){
    e.preventDefault();
    setErr('');
    try{
      const url = api + (mode==='login'?'/api/login':'/api/register');
      const res = await axios.post(url, {email,password});
      onLogin(res.data.token);
    }catch(e){ setErr(e?.response?.data?.error || 'Erro'); }
  }
  return (
    <div className="auth">
      <h2>{mode==='login'?'Entrar':'Registrar'}</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Senha" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">{mode==='login'?'Entrar':'Registrar'}</button>
      </form>
      <p className="error">{err}</p>
      <p onClick={()=>setMode(mode==='login'?'register':'login')} className="switch">{mode==='login'?'Criar conta':'Já tenho conta'}</p>
    </div>
  );
}

function Dashboard({token, api, onLogout}){
  const [beats, setBeats] = useState([]);
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');

  async function load(){
    try{
      const res = await axios.get(api + '/api/my-beats', authHeaders(token));
      setBeats(res.data);
    }catch(e){ console.error(e); }
  }
  useEffect(()=>{ load(); }, []);

  async function upload(e){
    e.preventDefault();
    if(!file) return setMsg('Escolha um arquivo');
    const fd = new FormData();
    fd.append('beat', file);
    fd.append('name', name);
    try{
      await axios.post(api + '/api/upload', fd, { headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'multipart/form-data' }});
      setMsg('Enviado!');
      setName(''); setFile(null);
      load();
    }catch(e){ setMsg('Erro no upload'); }
  }

  return (
    <div className="dashboard">
      <div className="top">
        <button onClick={onLogout}>Sair</button>
      </div>

      <section className="upload">
        <h3>Enviar novo beat</h3>
        <form onSubmit={upload}>
          <input placeholder="Nome do beat" value={name} onChange={e=>setName(e.target.value)} />
          <input type="file" accept="audio/*" onChange={e=>setFile(e.target.files[0])} />
          <button type="submit">Enviar</button>
        </form>
        <p>{msg}</p>
      </section>

      <section className="list">
        <h3>Meus Beats</h3>
        {beats.length===0 && <p>Sem beats ainda.</p>}
        {beats.map(b=>(
          <div className="beat" key={b.id}>
            <h4>{b.name}</h4>
            <audio controls src={`${api.replace(/:\/\/localhost:4000/, '')}${api.includes('localhost')? 'http://localhost:4000':''}/uploads/${b.filename}`} />
            <div className="actions">
              <a href={`http://localhost:4000/uploads/${b.filename}`} target="_blank" rel="noreferrer">Abrir</a>
              <button onClick={()=>{ navigator.share ? navigator.share({title:b.name, text:'Confira meu beat', url:`http://localhost:4000/uploads/${b.filename}`}) : alert('Use rede social para compartilhar') }}>Compartilhar</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
