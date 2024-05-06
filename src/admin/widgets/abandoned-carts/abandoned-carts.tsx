import type { WidgetConfig } from "@medusajs/admin";
import { Container, Table, Button } from "@medusajs/ui";
import { useAdminCustomQuery, useAdminCustomPost } from "medusa-react";
import ReactCountryFlag from "react-country-flag";
import React from "react";
import { AbandonedCartResponse } from "../../types/abandoned-cart";
import { toast } from "@medusajs/ui"
import LineLoading from "../../components/line-loading";;
import { Toaster } from "@medusajs/ui"

const AbandonedCarts = () => {

  const [pageSize, setPageSize] = React.useState(15);
  const [currentPage, setCurrentPage] = React.useState(0);
  const { data, isLoading, refetch } = useAdminCustomQuery<
    {
      take: number;
      skip: number;
      dateLimit?: number;
    },
    AbandonedCartResponse
  >("/abandoned-cart", [], {
    take: pageSize,
    skip: pageSize * currentPage,
    dateLimit: 10,
  });

  const { mutate, isLoading: PostLoading } = useAdminCustomPost<
    {
      id: string;
    },
    {
      success: boolean;
    }
  >("/abandoned-cart", []);

  const canPreviousPage = currentPage > 0;

  const canNextPage = currentPage < Math.round((data?.count ?? 0) / pageSize) - 1;

  const previousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handleAction = (id: string) => {
    mutate({ id }, {
      onSuccess: (data) => {
        console.log(data);
          toast.info("Email sent")
          refetch();
      },
      onError: (error) => {
        console.log(error);
        console.log(error.message);
        toast.error("Error sending email");
      },
    
    });
  }

  return (
    <Container className="text-ui-fg-subtle px-0 pt-0 pb-4">
      <Toaster />
      <div className="flex justify-between items-center p-5">
        <h2 className="text-lg font-bold">Abandoned Carts</h2>
      </div>
      <div className="flex gap-1 flex-col">
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Qty</Table.HeaderCell>
              <Table.HeaderCell>Region</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
              <Table.HeaderCell>Date Sent</Table.HeaderCell>
              <Table.HeaderCell>Count</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {!isLoading && data ? data.carts.map((cart) => {
              return (
                <Table.Row
                  key={cart?.id}
                  className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
                >
                  <Table.Cell>
                    {cart?.first_name + " " + cart?.last_name}
                  </Table.Cell>
                  <Table.Cell>{cart?.email}</Table.Cell>
                  <Table.Cell>{cart?.items?.length}</Table.Cell>
                  <Table.Cell>{cart?.region_name}</Table.Cell>
                  <Table.Cell>
                    {new Date(cart.created_at).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {cart?.currency ? new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cart?.currency || "USD",
                    }).format(cart?.totalPrice / 100) : cart?.totalPrice}
                  </Table.Cell>
                  <Table.Cell className="text-ui-fg-muted">
                    <ReactCountryFlag
                      countryCode={cart.country_code}
                      style={{
                        fontSize: "1.5em",
                        lineHeight: "1.5em",
                      }}
                      title={cart?.region_name}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    {cart?.abandoned_count ? new Date(cart?.abandoned_lastdate).toLocaleDateString() : "Not Sent"}
                  </Table.Cell>
                  <Table.Cell>
                    {cart?.abandoned_count ? cart?.abandoned_count : 0}
                  </Table.Cell>
                  <Table.Cell><Button disabled={PostLoading} variant="transparent" onClick={() => {
                    handleAction(cart?.id);
                  }}>Send Email</Button></Table.Cell>
                </Table.Row>
              );
            }): (
              <LineLoading />
            )}
          </Table.Body>
        </Table>
        <Table.Pagination
          count={data?.count || 0}
          pageSize={pageSize}
          pageIndex={currentPage}
          pageCount={Math.round((data?.count || 0) / pageSize)}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          previousPage={previousPage}
          nextPage={nextPage}
        />
      </div>
    </Container>
  );
};

export const config: WidgetConfig = {
  zone: "order.list.after",
};

export default AbandonedCarts;
