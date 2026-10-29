import { Link } from 'react-router-dom'
import AdminLayout from '../../components/layout/AdminLayout.jsx'
import '../../styles/pages/UserCreatePage.css'

const userFields = [
  { id: 'name', label: 'Name', placeholder: 'Full Name' },
  { id: 'username', label: 'Username' },
  { id: 'email', label: 'Email', type: 'email', placeholder: 'email@example.com' },
  { id: 'password', label: 'Password', type: 'password' },
  {
    id: 'confirm-password',
    name: 'confirmPassword',
    label: 'Confirm Password',
    type: 'password',
    placeholder: 'Confirm Password',
  },
  { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Phone Number' },
  {
    id: 'whatsapp-number',
    label: 'WhatsApp Number',
    type: 'tel',
    placeholder: 'WhatsApp Number',
  },
]

function UserCreatePage() {
  function handleSubmit(event) {
    event.preventDefault()
  }

  return (
    <AdminLayout pageClass="user-create">
      <main className="dashboard-main user-create-main">
        <header className="user-create-header">
          <h1>
            <span aria-hidden="true">➕</span>
            Add New User
          </h1>
        </header>

        <form className="user-create-card" onSubmit={handleSubmit}>
          {userFields.map(({ id, name, label, type = 'text', placeholder }) => (
            <div className="user-create-field" key={id}>
              <label htmlFor={id}>{label}</label>
              <input
                id={id}
                name={name ?? id}
                type={type}
                placeholder={placeholder}
              />
            </div>
          ))}

          <div className="user-create-field">
            <label htmlFor="user-type">User Type</label>
            <select id="user-type" name="userType" defaultValue="">
              <option value="">Select User Type</option>
            </select>
          </div>

          <div className="user-create-actions">
            <button type="submit" className="user-create-save">
              <span aria-hidden="true">⚡</span>
              Save User
            </button>
            <Link className="user-create-cancel" to="/admin/users">
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </AdminLayout>
  )
}

export default UserCreatePage
