import { getAccessExp, getRefreshToken, setAccessExp, setAccessToken, setRefreshToken } from "@/utils/authStorage";
import axios from "axios";

let refreshTimeout: NodeJS.Timeout;

export const startRefreshTimer = (
  accessExp?: number | null
) => {
  if (accessExp == null) {
    const storedExp =
      getAccessExp();

    console.log(
      "Stored Expiry:",
      storedExp
    );

    if (!storedExp) return;

    accessExp = Number(storedExp);
  }

  const expiryTime =
    accessExp * 1000;

  const now = Date.now();

  const refreshBefore =
    60 * 1000;

  const timeout =
    expiryTime -
    now -
    refreshBefore;



  console.log(
    "Expiry Time:",
    expiryTime
  );

  console.log(
    "Current Time:",
    now
  );

  console.log(
    "Timeout:",
    timeout
  );

  clearTimeout(refreshTimeout);

  if (timeout <= 0) {
    refreshAccessToken();
    return;
  }

  refreshTimeout = setTimeout(() => {
    refreshAccessToken();
  }, timeout);

  console.log(
    `Token refresh in ${
      timeout / 1000
    } seconds`
  );
};

export const refreshAccessToken =
  async () => {
    try {
      const refreshToken =
        getRefreshToken();

      if (!refreshToken) return;

      const response = await axios.post(
        "http://localhost:5000/auth/v1/token",
        {
          refreshToken,
          deviceId: "device-001",
        }
      );

      const data = response.data;
     
      setAccessToken(data.accessToken);

      setRefreshToken(data.refreshToken);

      setAccessExp(data.accessExp);

      console.log(
        "Access token refreshed"
      );

      // restart timer
      startRefreshTimer(
        data.accessExp
      );
    } catch (error) {
      console.log(
        "Refresh failed",
        error
      );

    //   localStorage.clear();

      window.location.href = "/";
    }
  };