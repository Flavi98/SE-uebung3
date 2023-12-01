import { $, component$, useSignal } from '@builder.io/qwik';
import { useNavigate } from '@builder.io/qwik-city';
import './styles.css';
import { jwtDecode } from 'jwt-decode';

interface JWTToken {
  isAdmin: number;
  username: string;
}

export default component$(() => {
  const navigate = useNavigate();
  const username = useSignal('');
  const password = useSignal('');

  const login = $(() => {
    fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value,
      })
    })
      .then((response) => response.json())
      .then((token) => {
        if (token) {
          const decode: JWTToken = jwtDecode(JSON.stringify(token));
          sessionStorage.setItem("username", decode.username);
          sessionStorage.setItem("isAdmin", JSON.stringify(decode.isAdmin));
          if (decode.isAdmin === 1) {
            navigate('/admin');
          } else {
            navigate('/persons');
          }
        }
      })
  })

  return (
    <div class="container-login">
      <h1>App Login</h1>
      <form>
        <label for="username">Username:</label>
        <input bind:value={username} type="text" id="username" name="username"></input>
        <label for="username">Passwort:</label>
        <input bind:value={password} type="password" id="password" name="password"></input>
      </form>
      <button onClick$={() => login()}>Einloggen</button>
    </div>
  );
});