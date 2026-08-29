function AddMoneyPage() {
  const [methods, setMethods] = useState<DbPaymentMethod[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [sourceId, setSourceId] = useState("");
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string>();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<DbProviderPayment | null>(null);
  const [providerPayment, setProviderPayment] = useState<DbProviderPayment | null>(null);

  useEffect(() => {
    Promise.all([getMyPaymentMethods(), getCurrentWallet()])
      .then(([loadedMethods, wallet]) => {
        setMethods(loadedMethods);
        setSourceId(loadedMethods.find((m) => m.is_default)?.id ?? loadedMethods[0]?.id ?? "");
        setWalletBalance(Number(wallet?.balance) || 0);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load payment methods."))
      .finally(() => setLoading(false));
  });
