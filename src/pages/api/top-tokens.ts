import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const resp = await axios.get(
        `https://min-api.cryptocompare.com/data/top/totalvolfull?tsym=USD&limit=100`,
        {
          headers: {
            "Content-type": "application/json",
            authorization:
              "Apikey 2960fc09d418f424a2e7e097474bdd199a4250fb7c3cdf7bb3c69e0ecd9fefbd",
          },
        }
      );

      const myData = resp.data.Data.filter(
        (d: any) => d && d.CoinInfo && d.RAW
      ).map((d: any) => ({
        name: d.CoinInfo.FullName,
        symbol: d.CoinInfo.Name,
        price: d.RAW.USD.PRICE,
        change_1d: d.RAW.USD.CHANGEPCT24HOUR,
        image: `https://cryptocompare.com${d.CoinInfo.ImageUrl}`,
        url: `https://cryptocompare.com${d.CoinInfo.Url}`,
      }));

      res.status(200).json(myData);
    } catch (error: any) {
      console.error("Error processing request:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
