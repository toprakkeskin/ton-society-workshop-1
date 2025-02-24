"use client";

import {
  Avatar,
  Button,
  Cell,
  Divider,
  Image,
  Input,
  List,
  Section,
  Text,
  Title,
} from "@telegram-apps/telegram-ui";

import { Link } from "@/components/Link/Link";
import { Page } from "@/components/Page";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import tonSvg from "./_assets/ton.svg";
import {
  TonConnectButton,
  useTonAddress,
  useTonWallet,
} from "@tonconnect/ui-react";
import { initData, useLaunchParams, useSignal } from "@telegram-apps/sdk-react";
import { IUser } from "@/lib/inMemoryStore";

export default function Home() {
  //#region States
  // Telegram, User and Wallet States
  const lp = useLaunchParams();
  const tgInitDataRaw = useSignal(initData.raw);

  const [user, setUser] = useState<IUser | null | undefined>(null);
  const wallet = useTonWallet();
  const walletUserFriendlyAddress = useTonAddress();

  // Response messages
  const [msgSignIn, setMsgSignIn] = useState("");
  const [msgWallet, setMsgWallet] = useState("");
  const [msgQrGenerate, setMsgQrGenerate] = useState("");
  const [msgQrList, setMsgQrList] = useState("");

  // QR Code States
  const [inputValue, setInputValue] = useState("");
  const [qrValue, setQrValue] = useState("");
  const [qrCodes, setQrCodes] = useState<any[]>([]);

  //#endregion

  //#region Functions

  const saveGeneratedQrCode = async () => {
    try {
      const response = await fetch("/api/qr-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: qrValue }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setMsgQrGenerate(`QR Code Saved: ${data.id}`);
      } else {
        setMsgQrGenerate(`Error: ${data.message}`);
      }
    } catch (error) {
      setMsgQrGenerate("Failed to save QR Code");
    }
  };

  const fetchQrCodes = async () => {
    try {
      const response = await fetch("/api/qr-codes", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        const dataSorted = data.sort(
          (a: { createdAt: string }, b: { createdAt: string }) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setQrCodes(dataSorted);
        setMsgQrList(`#${data?.length} Total QR Codes Loaded`);
      } else {
        setMsgQrList(`Error: ${data.message}`);
      }
    } catch (error) {
      setMsgQrList("Failed to fetch QR codes");
    }
  };

  const updateWallet = async (walletAddress: string) => {
    try {
      const response = await fetch("/api/wallets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
        credentials: "include",
      });

      const data = await response.json();
      if (response.ok) {
        setMsgWallet(`Wallet Address Updated`);
      } else {
        setMsgWallet(`Failed to update wallet address: ${data.message}`);
      }
    } catch (error) {
      setMsgWallet(`Failed to update wallet address: ${error}`);
    }

    return true;
  };
  //#endregion

  //#region Effects

  // Auto sign-in
  useEffect(() => {
    if (lp && !user && tgInitDataRaw) {
      (async () => {
        try {
          const response = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tgInitData: tgInitDataRaw,
              startParam: lp.startParam,
            }),
            credentials: "include",
          });

          const data = await response.json();
          if (response.ok) {
            setUser(data?.user);
          } else {
            setMsgSignIn(`Error: ${data.message}`);
          }
        } catch (error) {
          setMsgSignIn("Failed to sign in");
        }
      })();
    }
  }, [user, tgInitDataRaw, lp]);

  useEffect(() => {
    // const connectedWalletAddress = wallet?.account?.address
    if (
      walletUserFriendlyAddress &&
      user &&
      user.walletAddress !== walletUserFriendlyAddress
    ) {
      updateWallet(walletUserFriendlyAddress).then((ok) => {
        if (ok) {
          user.walletAddress = walletUserFriendlyAddress;
          setUser(user);
        }
      });
    }
  }, [walletUserFriendlyAddress, user]);
  //#endregion

  return (
    <Page back={false}>
      <List>
        {/* USER SECTION */}
        <Section header="User Information">
          <Cell>
            <div className="px-6 pb-6">
              {user && (
                <Text weight="3">
                  Signed in as:
                  <List>
                    {Object.entries(user).map(([key, value]) => (
                      <Cell key={key}>
                        <strong>{key}:</strong> {String(value)}
                      </Cell>
                    ))}
                  </List>
                </Text>
              )}
            </div>
          </Cell>
          {msgSignIn && <Cell>{msgSignIn}</Cell>}
        </Section>

        {/* WALLET SECTION */}
        <Section header="Connect Your Wallet">
          {wallet ? (
            <>
              {"imageUrl" in wallet && (
                <>
                  <Cell
                    before={
                      <Avatar
                        src={wallet.imageUrl}
                        alt="Provider logo"
                        width={60}
                        height={60}
                      />
                    }
                    // after={<Navigation>About wallet</Navigation>}
                    subtitle={
                      <>
                        <TonConnectButton className="ton-connect-page__button-connected" />
                      </>
                    }
                  >
                    <Title level="3">{wallet.name}</Title>
                    <Text>{wallet.appName}</Text>
                  </Cell>
                </>
              )}
            </>
          ) : (
            <Link href="/ton-connect">
              <Cell
                before={
                  <Image
                    alt=""
                    src={tonSvg.src}
                    style={{ backgroundColor: "#007AFF" }}
                  />
                }
                subtitle="Connect your TON wallet"
              >
                TON Connect
              </Cell>
            </Link>
          )}

          {msgWallet && <Cell>{msgWallet}</Cell>}
        </Section>

        {/* QR CODE GENERATION SECTION */}
        <Section header="QR Code Generation">
          <Cell
            before={
              <>
                <Input
                  type="text"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  placeholder="Enter QR code value"
                  className="min-w-[100px]"
                />
              </>
            }
          ></Cell>
          <Cell>
            <div className="px-6 flex justify-between gap-4">
              <Button onClick={() => setQrValue(inputValue)}>Generate</Button>
              <Button onClick={saveGeneratedQrCode}>Save</Button>
            </div>
          </Cell>
          {msgQrGenerate && <Cell>{msgQrGenerate}</Cell>}

          {qrValue?.length > 0 ? (
            <Cell
              style={{
                height: "auto",
                margin: "0 0",
                maxWidth: 256,
                width: "100%",
              }}
            >
              <QRCode
                size={256}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                value={qrValue}
                viewBox={`0 0 256 256`}
              />
            </Cell>
          ) : (
            ""
          )}
        </Section>

        {/* MY QR CODES SECTION*/}
        <Section header="My QR Codes">
          <Cell>
            <Button onClick={fetchQrCodes}>Fetch My QR Codes</Button>
          </Cell>
          {msgQrList && <Cell>{msgQrList}</Cell>}
          {qrCodes.length > 0 && (
            <List>
              {qrCodes.map((qrCode) => (
                <div className="px-6 pb-6" key={qrCode.id}>
                  <Cell
                    before={
                      <QRCode
                        size={256}
                        style={{
                          height: "auto",
                          maxWidth: "100%",
                          width: "100%",
                        }}
                        value={qrCode.value}
                        viewBox={`0 0 256 256`}
                      />
                    }
                    subtitle={`QR Code ID: ${qrCode.id}`}
                  >
                    <Text>{qrCode.value}</Text>
                  </Cell>
                </div>
              ))}
            </List>
          )}
        </Section>

        {/* APP DATA SECTION */}
        <Divider />
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link href="/init-data">
            <Cell subtitle="User data, chat information, technical data">
              Init Data
            </Cell>
          </Link>
          <Link href="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">
              Launch Parameters
            </Cell>
          </Link>
          <Link href="/theme-params">
            <Cell subtitle="Telegram application palette information">
              Theme Parameters
            </Cell>
          </Link>
        </Section>
      </List>
    </Page>
  );
}
