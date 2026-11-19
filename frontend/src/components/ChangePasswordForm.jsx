import Button from './Button'
import PasswordField from './PasswordField'
import Spinner from './Spinner'

export default function ChangePasswordForm({ passwords, onChange, onSubmit, saving }) {
  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <h3 className="font-editorial text-xl font-bold text-[#291C2E]">
        Change password
      </h3>

      <div className="space-y-4">
        <PasswordField
          label="Old password"
          placeholder="••••••••"
          theme="light"
          value={passwords.current}
          onChange={(e) => onChange('current', e.target.value)}
        />
        <PasswordField
          label="New password"
          placeholder="••••••••"
          theme="light"
          value={passwords.next}
          onChange={(e) => onChange('next', e.target.value)}
        />
        <PasswordField
          label="Repeat new password"
          placeholder="••••••••"
          theme="light"
          value={passwords.repeat}
          onChange={(e) => onChange('repeat', e.target.value)}
        />
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={saving} variant="primary" size="md">
          {saving ? <Spinner label="Updating password..." /> : 'Update password'}
        </Button>
      </div>
    </form>
  )
}
