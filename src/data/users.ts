/**
 * Credenciais de teste publicadas na própria página de login do Sauce Demo.
 * A senha pode ser sobrescrita via variável de ambiente para não acoplar o
 * código ao valor (útil caso o ambiente alvo use outra senha).
 */
export const PASSWORD = process.env.SAUCE_PASSWORD ?? 'secret_sauce';

export interface User {
  username: string;
  password: string;
}

export const users = {
  standard: { username: 'standard_user', password: PASSWORD },
  lockedOut: { username: 'locked_out_user', password: PASSWORD },
} as const satisfies Record<string, User>;

export interface InvalidLoginCase {
  title: string;
  username: string;
  password: string;
  expectedError: string;
}

/** Cenários negativos de login (data-driven). */
export const invalidLoginCases: InvalidLoginCase[] = [
  {
    title: 'usuário e senha vazios',
    username: '',
    password: '',
    expectedError: 'Epic sadface: Username is required',
  },
  {
    title: 'senha vazia',
    username: users.standard.username,
    password: '',
    expectedError: 'Epic sadface: Password is required',
  },
  {
    title: 'senha incorreta',
    username: users.standard.username,
    password: 'wrong_password',
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    title: 'usuário inexistente',
    username: 'unknown_user',
    password: PASSWORD,
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    title: 'usuário bloqueado (locked_out_user)',
    username: users.lockedOut.username,
    password: users.lockedOut.password,
    expectedError: 'Epic sadface: Sorry, this user has been locked out.',
  },
];
