package domain

type User struct {
	id          int64
	username    string
	name        string
	preferences Preferences
}

func NewUser(username string, name string) User {
	return User{
		username:    username,
		name:        name,
		preferences: Preferences{},
	}
}

func RehydrateUser(id int64, username string, name string, prefs Preferences) User {
	return User{
		id:          id,
		username:    username,
		name:        name,
		preferences: prefs,
	}
}

func (u *User) ID() int64 {
	return u.id
}

func (u *User) Preferences() Preferences {
	return u.preferences
}

func (u *User) Username() string {
	return u.username
}

func (u *User) Name() string {
	return u.name
}

func (u *User) SetID(id int64) {
	u.id = id
}

func (u *User) SetPreferences(prefs Preferences) {
	u.preferences = prefs
}
