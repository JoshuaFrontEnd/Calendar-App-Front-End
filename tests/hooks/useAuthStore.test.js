import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { calendarApi } from '../../src/api';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { authSlice } from '../../src/store';
import { initialState, notAuthenticatedState } from '../fixtures/authStates';
import { testUserCredentials } from '../fixtures/testUser';

const getMockStore = ( initialState ) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer
    },
    preloadedState: {
      auth: { ...initialState }
    }
  })
}


describe('Pruebas en el useAuthStore', () => {

  beforeEach(() => localStorage.clear() );

  test('debe de regresar los valores por defecto', () => {

    const mockStore = getMockStore({ ...initialState });

    const { result } = renderHook( () => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
    });

    expect( result.current ).toEqual({
      status: 'checking',
      user: {},
      errorMessage: undefined,
      checkAuthToken: expect.any( Function ),
      startLogin: expect.any( Function ),
      startRegister: expect.any( Function ),
      startLogout: expect.any( Function )
    })

  })

  test('startLogin debe de realizar el login correctamente', async () => {

    const mockStore = getMockStore({ ...notAuthenticatedState });

    const { result } = renderHook( () => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
    });

    await act( async () => {
      await result.current.startLogin( testUserCredentials );
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: 'authenticated',
      user: { name: 'Test User', uid: '6599d2b7cde0322e13b193e7' },
    })

    expect( localStorage.getItem( 'token' ) ).toEqual( expect.any( String ) );
    expect( localStorage.getItem( 'token-init-date' ) ).toEqual( expect.any( String ) );

  })

  test('startLogin debe de fallar la autenticacion', async () => {

    const mockStore = getMockStore({ ...notAuthenticatedState });

    const { result } = renderHook( () => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={ mockStore }>{ children }</Provider>
    });

    // Usuario falso para forzar la no autenticacion
    await act( async () => {
      await result.current.startLogin({ email: 'test@example.com', password: 'abcxyz'});
    });

    const { errorMessage, status, user } = result.current;

    expect( localStorage.getItem('token') ).toBe( null );

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: 'Credenciales incorrectas',
      status: 'not-authenticated',
      user: {}
    })

    await waitFor(
      () => expect( result.current.errorMessage ).toBe( undefined )
    );

  })

  test('startRegister debe de crear un usuario', async () => {

    const newUser = { email: 'test@example.com', password: 'abcxyz', name: 'Test User 2' };

    const mockStore = getMockStore({ ...notAuthenticatedState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
    });

    const spy = jest.spyOn( calendarApi, 'post').mockReturnValue({
      data: {
        "ok": true,
        "uid": "ALGUN-UID",
        "name": "Test User",
        "token": "ALGUN-TOKEN"
      }
    })

    await act( async () => {
      await result.current.startRegister( newUser );
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: 'authenticated',
      user: { name: 'Test User', uid: 'ALGUN-UID' }
    })

    spy.mockRestore();

  })

  test('startRegister debe de fallar la creacion de un usuario', async () => {

    const mockStore = getMockStore({ ...notAuthenticatedState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
    });

    await act( async () => {
      await result.current.startRegister( testUserCredentials );
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: 'Ya existe un usuario con ese correo',
      status: 'not-authenticated',
      user: {}
    })

  })

  test('checkAuthToken debe de fallar si no hay token', async () => {

    const mockStore = getMockStore({ ...initialState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
    });

    await act( async () => {
      await result.current.checkAuthToken();
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: 'not-authenticated',
      user: {}
    })

  })

  test('checkAuthToken debe de autenticar al usuario si hay un token', async () => {

    const { data } = await calendarApi.post('/auth', testUserCredentials );

    localStorage.setItem('token', data.token );

    const mockStore = getMockStore({ ...initialState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => <Provider store={mockStore}>{children}</Provider>
    });

    await act( async () => {
      await result.current.checkAuthToken();
    });

    const { errorMessage, status, user } = result.current;

    expect({ errorMessage, status, user }).toEqual({
      errorMessage: undefined,
      status: 'authenticated',
      user: { name: 'Test User', uid: '6599d2b7cde0322e13b193e7' }
    })

  })

})