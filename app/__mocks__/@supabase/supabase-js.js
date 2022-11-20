const user = {
  id: "123",
  aud: "123",
  created_at: "",
  app_metadata: {
    provider: "",
  },
  user_metadata: {},
};

export const session = jest.fn().mockReturnValue({ user: null });

let client = {
  auth: {
    signUp: jest.fn().mockResolvedValue({ user: {}, error: null }),
    session,
    onAuthStateChange() {
      return { data: null };
    },
    getSession : jest.fn().mockResolvedValue({user, session: "somethign"}) 
  },
  from: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  filter: jest.fn().mockReturnThis(),
};

export const createClient = jest.fn().mockReturnValue(client);
