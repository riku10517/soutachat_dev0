import NextAuth, { NextAuthOptions } from "next-auth";
import { Provider } from "next-auth/providers";
import AzureADProvider from "next-auth/providers/azure-ad";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { hashValue } from "./helpers";

// Identity Providerの設定を行う関数
const configureIdentityProvider = () => {
  const providers: Array<Provider> = [];

  const adminEmails = process.env.ADMIN_EMAIL_ADDRESS?.split(",").map(email => email.toLowerCase().trim());

  // GitHubの認証プロバイダーを追加
  if (process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.AUTH_GITHUB_ID!,
        clientSecret: process.env.AUTH_GITHUB_SECRET!,
        async profile(profile) {
          const newProfile = {
            ...profile,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase())
          }
          return newProfile;
        }
      })
    );
  }

  // Azure ADの認証プロバイダーを追加
  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    providers.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID!,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
        tenantId: process.env.AZURE_AD_TENANT_ID!,
        async profile(profile) {

          const newProfile = {
            ...profile,
            // throws error without this - unsure of the root cause (https://stackoverflow.com/questions/76244244/profile-id-is-missing-in-google-oauth-profile-response-nextauth)
            id: profile.sub,
            isAdmin: adminEmails?.includes(profile.email.toLowerCase()) || adminEmails?.includes(profile.preferred_username.toLowerCase())
          }
          return newProfile;
        }
      })
    );
  }

  // 開発環境の場合、基本的なCredentialプロバイダーも追加
  // パスワードの検証は行わず、任意のユーザー名でユーザーを作成します
  // 参考：https://next-auth.js.org/configuration/providers/credentials
  if (process.env.NODE_ENV === "development") {
    providers.push(
      CredentialsProvider({
        name: "localdev",
        credentials: {
          username: { label: "Username", type: "text", placeholder: "dev" },
          password: { label: "Password", type: "password" },
        },    
        async authorize(credentials, req): Promise<any> {
          // 認証情報を検証してユーザーを返すためのロジックをここに記述できます
          // ここでは、任意のユーザー名で新しいユーザーを作成します
          // userHashedId（helpers.ts）に基づいてメールのハッシュをIDとして作成します
          const username = credentials?.username || "dev";
          const email = username + "@localhost";
          const user = {
              id: hashValue(email),
              name: username,
              email: email,
              isAdmin: false,
              image: "",
            };
          console.log("=== DEV USER LOGGED IN:\n", JSON.stringify(user, null, 2));
          return user;
        }
      })
    );
  }

  return providers;
};

// NextAuthのオプションを設定
export const options: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [...configureIdentityProvider()], // Identity Providerの設定を適用
  callbacks: {

    //認可機能
    async signIn({ user, account, profile, email, credentials }) {
     
      console.log("===> signIn : ", user.email);  // テスト用出力(削除可)
     
      // メールアドレス判定（特定文字列が含まれる場合に認証通過）
      if (user.email?.includes("@nw."))  // TODO:認証を通す文字列指定
      {
        // 認証OK
        console.log("===> signIn : success");  // テスト用出力(削除可)
        return true
      }
 
      // 認証NG
      console.log("===> signIn : failed");  // テスト用出力(削除可)
      return false
    },



    async jwt({token, user, account, profile, isNewUser, session}) {
      // ユーザーが管理者の場合、JWTトークンにisAdminフラグを追加
      if (user?.isAdmin) {
       token.isAdmin = user.isAdmin
      }
      return token
    },
    async session({session, token, user }) {
      // セッションにisAdminフラグを追加
      session.user.isAdmin = token.isAdmin as string
      return session
    }
  },
  session: {
    strategy: "jwt", // セッションストラテジーをJWTに設定
  },
};

export const handlers = NextAuth(options);