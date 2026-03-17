export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: { phone: string; type: 'register' | 'forgot' };
  ForgotPassword: undefined;
  ResetPassword: { phone: string; resetToken: string };
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  ChangeContact: { type: 'phone' | 'email' };
  ProductDetail: { productId: number };
  CategoryProducts: { category: string };
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: number };
  OrderHistory: undefined;
  OrderDetail: { orderId: number };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}