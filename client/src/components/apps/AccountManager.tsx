import { FC, useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Trash2, UserPlus, Shield, Calendar, Clock } from 'lucide-react';

interface User {
  username: string;
  password: string;
  fullName: string;
  avatar?: string;
  lastLogin?: Date;
  theme: 'light' | 'dark' | 'auto';
  wallpaper: string;
  createdAt?: Date;
  isAdmin?: boolean;
}

export const AccountManager: FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    theme: 'dark' as 'light' | 'dark' | 'auto',
    wallpaper: 'arch'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newUserForm, setNewUserForm] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    isAdmin: false
  });

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadUsers = () => {
    const stored = localStorage.getItem('webos-users');
    if (stored) {
      setUsers(JSON.parse(stored));
    }
  };

  const loadCurrentUser = () => {
    const stored = localStorage.getItem('webos-current-user');
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setSelectedUser(user);
      setProfileForm({
        fullName: user.fullName,
        theme: user.theme || 'dark',
        wallpaper: user.wallpaper || 'arch'
      });
    }
  };

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('webos-users', JSON.stringify(updatedUsers));
  };

  const handleUpdateProfile = () => {
    if (!currentUser) return;

    if (!profileForm.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    const updatedUser = {
      ...currentUser,
      fullName: profileForm.fullName,
      theme: profileForm.theme,
      wallpaper: profileForm.wallpaper
    };

    const updatedUsers = users.map(u => 
      u.username === currentUser.username ? updatedUser : u
    );

    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('webos-current-user', JSON.stringify(updatedUser));

    // Apply theme and wallpaper changes
    document.documentElement.classList.toggle('dark', profileForm.theme === 'dark');
    window.dispatchEvent(new CustomEvent('wallpaper-change', { 
      detail: { wallpaper: profileForm.wallpaper } 
    }));

    setIsEditingProfile(false);
    setSuccess('Profile updated successfully');
    setError('');
  };

  const handleChangePassword = () => {
    if (!currentUser) return;

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordForm.currentPassword !== currentUser.password) {
      setError('Current password is incorrect');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 4) {
      setError('Password must be at least 4 characters long');
      return;
    }

    const updatedUser = {
      ...currentUser,
      password: passwordForm.newPassword
    };

    const updatedUsers = users.map(u => 
      u.username === currentUser.username ? updatedUser : u
    );

    saveUsers(updatedUsers);
    setCurrentUser(updatedUser);
    localStorage.setItem('webos-current-user', JSON.stringify(updatedUser));

    setIsChangingPassword(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSuccess('Password changed successfully');
    setError('');
  };

  const handleCreateUser = () => {
    if (!newUserForm.username || !newUserForm.fullName || !newUserForm.password || !newUserForm.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (newUserForm.password !== newUserForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (users.some(u => u.username === newUserForm.username)) {
      setError('Username already exists');
      return;
    }

    const newUser: User = {
      username: newUserForm.username.toLowerCase(),
      fullName: newUserForm.fullName,
      password: newUserForm.password,
      theme: 'dark',
      wallpaper: 'arch',
      createdAt: new Date(),
      isAdmin: newUserForm.isAdmin
    };

    saveUsers([...users, newUser]);
    setIsCreatingUser(false);
    setNewUserForm({ username: '', fullName: '', password: '', confirmPassword: '', isAdmin: false });
    setSuccess('User created successfully');
    setError('');
  };

  const handleDeleteUser = (userToDelete: User) => {
    if (userToDelete.username === currentUser?.username) {
      setError('Cannot delete your own account');
      return;
    }

    if (confirm(`Are you sure you want to delete user "${userToDelete.fullName}"?`)) {
      const updatedUsers = users.filter(u => u.username !== userToDelete.username);
      saveUsers(updatedUsers);
      setSuccess('User deleted successfully');
      setError('');
    }
  };

  const isCurrentUserAdmin = currentUser?.isAdmin || currentUser?.username === 'admin';

  return (
    <div className="h-full flex flex-col bg-background p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Account Manager</h1>
          <p className="text-muted-foreground">Manage user accounts and settings</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current User Profile */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Your Profile
            </h2>

            {currentUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{currentUser.fullName}</h3>
                    <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
                    {currentUser.isAdmin && (
                      <Badge variant="secondary" className="mt-1">
                        <Shield className="w-3 h-3 mr-1" />
                        Administrator
                      </Badge>
                    )}
                  </div>
                </div>

                {currentUser.lastLogin && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Last login: {new Date(currentUser.lastLogin).toLocaleString()}
                  </div>
                )}

                <Separator />

                {!isEditingProfile ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Theme</Label>
                      <p className="text-sm text-muted-foreground capitalize">{currentUser.theme}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Wallpaper</Label>
                      <p className="text-sm text-muted-foreground capitalize">{currentUser.wallpaper}</p>
                    </div>
                    <Button onClick={() => setIsEditingProfile(true)} variant="outline" className="w-full">
                      Edit Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <select
                        id="theme"
                        value={profileForm.theme}
                        onChange={(e) => setProfileForm({ ...profileForm, theme: e.target.value as any })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="wallpaper">Wallpaper</Label>
                      <select
                        id="wallpaper"
                        value={profileForm.wallpaper}
                        onChange={(e) => setProfileForm({ ...profileForm, wallpaper: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="arch">Arch Linux</option>
                        <option value="matrix">Matrix</option>
                        <option value="cyber">Cyberpunk</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateProfile} className="flex-1">Save</Button>
                      <Button onClick={() => setIsEditingProfile(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                )}

                <Separator />

                {!isChangingPassword ? (
                  <Button 
                    onClick={() => setIsChangingPassword(true)} 
                    variant="outline" 
                    className="w-full"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleChangePassword} className="flex-1">Change Password</Button>
                      <Button onClick={() => setIsChangingPassword(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* User Management */}
          {isCurrentUserAdmin && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  User Management
                </h2>
                <Button 
                  onClick={() => setIsCreatingUser(true)} 
                  size="sm"
                  disabled={isCreatingUser}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>

              {isCreatingUser && (
                <Card className="p-4 mb-4 bg-muted/50">
                  <h3 className="font-medium mb-3">Create New User</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="newUsername">Username</Label>
                      <Input
                        id="newUsername"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newFullName">Full Name</Label>
                      <Input
                        id="newFullName"
                        value={newUserForm.fullName}
                        onChange={(e) => setNewUserForm({ ...newUserForm, fullName: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newUserPassword">Password</Label>
                      <Input
                        id="newUserPassword"
                        type="password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmNewUserPassword">Confirm Password</Label>
                      <Input
                        id="confirmNewUserPassword"
                        type="password"
                        value={newUserForm.confirmPassword}
                        onChange={(e) => setNewUserForm({ ...newUserForm, confirmPassword: e.target.value })}
                        placeholder="Confirm password"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAdmin"
                        checked={newUserForm.isAdmin}
                        onChange={(e) => setNewUserForm({ ...newUserForm, isAdmin: e.target.checked })}
                      />
                      <Label htmlFor="isAdmin">Administrator privileges</Label>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateUser} className="flex-1">Create User</Button>
                      <Button onClick={() => setIsCreatingUser(false)} variant="outline">Cancel</Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.username} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">@{user.username}</div>
                          <div className="flex gap-2 mt-1">
                            {user.isAdmin && (
                              <Badge variant="secondary" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Admin
                              </Badge>
                            )}
                            {user.lastLogin && (
                              <Badge variant="outline" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(user.lastLogin).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      {user.username !== currentUser?.username && (
                        <Button
                          onClick={() => handleDeleteUser(user)}
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};