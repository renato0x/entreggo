import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  DocumentUpload: undefined;
};

export type AppTabParamList = {
  Home: undefined;
  ActiveDeliveries: undefined;
  History: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabParamList>;
  DeliveryDetails: { orderId: string };
  PickupConfirmation: { orderId: string; establishmentName: string };
  OTPValidation: { orderId: string };
  DeliverySuccess: { orderId: string };
  NotificationSettings: undefined;
  Settings: undefined;
  EditProfile: undefined;
  Categories: undefined;
  NotFound: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
