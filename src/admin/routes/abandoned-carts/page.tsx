import { RouteConfig } from "@medusajs/admin";
import { CircleStack } from "@medusajs/icons";
import AbandonedCarts from "../../components/table-with-carts";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AbandonedCartResponse } from "../../types/abandoned-cart";
import { useAdminCustomQuery } from "medusa-react";

const CustomPage = () => {
  const { data, isLoading, refetch } = useAdminCustomQuery<
    {
      take: number;
      skip: number;
      dateLimit?: number;
    },
    AbandonedCartResponse
  >("/abandoned-cart", [], {
    take: 15,
    skip: 15 * 1,
    dateLimit: 50,
  });
  return (
    <div>
      <div>
        <AreaChart
          width={730}
          height={250}
          data={data?.carts}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="created_at" />
          <YAxis />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="totalPrice"
            stroke="#8884d8"
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </div>
      <AbandonedCarts />
    </div>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Abandoned Carts",
    icon: CircleStack,
  },
};

export default CustomPage;
