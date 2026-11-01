import Button from './Button'
import PasswordField from './PasswordField'
import Spinner from './Spinner'

// Change the signed-in user's password.
export default function ChangePasswordForm({ passwords, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <h2 className="text-lg font-semibold text-slate-900">Change password</h2>
      <PasswordField label="Old password" value={passwords.current} onChange={(event) => onChange({ ...passwords, current: event.target.value })} />
      <PasswordField label="New password" value={passwords.next} onChange={(event) => onChange({ ...passwords, next: event.target.value })} />
      <PasswordField label="Repeat new password" value={passwords.repeat} onChange={(event) => onChange({ ...passwords, repeat: event.target.value })} />
      <Button type="submit" disabled={saving}>{saving ? <Spinner label="Updating..." /> : 'Update password'}</Button>
    </form>
  )
}
