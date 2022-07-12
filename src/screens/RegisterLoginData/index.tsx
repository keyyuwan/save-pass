import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useForm } from "react-hook-form";
import { RFValue } from "react-native-responsive-fontsize";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
import { StackNavigationProp } from "@react-navigation/stack";

import { useAuth } from "../../hooks/useAuth";
import { Header } from "../../components/Header";
import { Input } from "../../components/Form/Input";
import { Button } from "../../components/Form/Button";

import { Container, Form } from "./styles";

interface FormData {
  service_name: string;
  email: string;
  password: string;
}

const schema = Yup.object().shape({
  service_name: Yup.string().required("Nome do serviço é obrigatório!"),
  email: Yup.string()
    .email("Não é um email válido")
    .required("Email é obrigatório!"),
  password: Yup.string().required("Senha é obrigatória!"),
});

type RootStackParamList = {
  Home: undefined;
  RegisterLoginData: undefined;
};

type NavigationProps = StackNavigationProp<
  RootStackParamList,
  "RegisterLoginData"
>;

export function RegisterLoginData() {
  const { user } = useAuth();
  const { navigate } = useNavigation<NavigationProps>();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function handleRegister(formData: FormData) {
    const newLoginData = {
      id: String(uuid.v4()),
      ...formData,
    };

    try {
      const dataKey = `@savepass:logins_user:${user.id}`;
      const storagedServiceData = await AsyncStorage.getItem(dataKey);
      const serviceData = storagedServiceData
        ? JSON.parse(storagedServiceData)
        : [];

      const servicesWithTheNewOne = [...serviceData, newLoginData];

      await AsyncStorage.setItem(
        dataKey,
        JSON.stringify(servicesWithTheNewOne)
      );

      navigate("Home");
    } catch (err) {
      console.log(err);
      Alert.alert("Não foi possível salvar sua senha");
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      enabled
    >
      <Header />
      <Container>
        <Form>
          <Input
            testID="service-name-input"
            title="Nome do serviço"
            name="service_name"
            error={errors.service_name && errors.service_name.message}
            control={control}
            autoCapitalize="sentences"
            autoCorrect
          />
          <Input
            testID="email-input"
            title="E-mail ou usuário"
            name="email"
            error={errors.email && errors.email.message}
            control={control}
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            testID="password-input"
            title="Senha"
            name="password"
            error={errors.password && errors.password.message}
            control={control}
            secureTextEntry
          />

          <Button
            style={{
              marginTop: RFValue(8),
            }}
            title="Salvar"
            onPress={handleSubmit(handleRegister)}
          />
        </Form>
      </Container>
    </KeyboardAvoidingView>
  );
}
