import { useState } from 'react';
import Button from '../../ui/Button';
import { useDispatch } from 'react-redux';
import { updateName } from './userSlice';
import { useNavigate } from 'react-router-dom';

function CreateUser() {
  const [username, setUsername] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();

    if (!username) return;

    dispatch(updateName(username));
    navigate('./menu');
  }

  return (
    <form onSubmit={handleSubmit}>
      <p className="mb-4 text-sm">
        👋 Bienvenido, empieza diciendonos tu nombre:
      </p>

      <input
        type="text"
        placeholder="Nombre completo"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input mb-8 w-72"
      />

      {username !== '' && (
        <div>
          <Button type="primary">Empieza a ordenar</Button>
        </div>
      )}
    </form>
  );
}

export default CreateUser;
