const user = {
  id: "123",
  aud: "123",
  created_at: "",
  app_metadata: {
    provider: "",
  },
  user_metadata: {},
};

export const Auth = {
  useUser: jest.fn().mockReturnValue({
    user,
    session: user,
  }),
  UserContextProvider: ({ children }) => <>{children}</>,
};
