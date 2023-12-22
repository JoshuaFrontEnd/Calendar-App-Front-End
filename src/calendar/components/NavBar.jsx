import { useAuthStore } from '../../hooks';

export const NavBar = () => {

  const { startLogout, user } = useAuthStore();

  return (
    <div className="navbar navbar-dark bg-dark mb-4 px-4">

      <span className="navbar-brand">
        <i className="fas fa-calendar-alt me-2"></i>
        <span>{ user.name }</span>
      </span>

      <button
        className="btn btn-outline-danger"
        onClick={ startLogout }
      >
        <i className="fas fa-sign-out-alt me-2"></i>
        <span>Salir</span>
      </button>

    </div>
  )
}
