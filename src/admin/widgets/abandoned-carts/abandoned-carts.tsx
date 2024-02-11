import type { WidgetConfig } from "@medusajs/admin";
import { Container, Table } from "@medusajs/ui";
import { useAdminCustomQuery } from "medusa-react";
import ReactCountryFlag from "react-country-flag";
import React from "react";
import { AbandonedCartResponse } from "../../types/abandoned-cart";

const AbandonedCarts = () => {
  const [pageSize, setPageSize] = React.useState(15);
  const [currentPage, setCurrentPage] = React.useState(0);
  const { data, isLoading } = useAdminCustomQuery<
    {
      take: number;
      skip: number;
    },
    AbandonedCartResponse
  >("/abandoned", ["abandoned"], {
    take: pageSize,
    skip: pageSize * currentPage,
  });

  if (isLoading) {
    return null;
  }

  if (!data) {
    return null;
  }

  const canPreviousPage = currentPage > 0;

  const canNextPage = currentPage < Math.round(data.count / pageSize) - 1;

  const previousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  return (
    <Container className="text-ui-fg-subtle px-0 pt-0 pb-4">
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
              <Table.HeaderCell className="text-right">Amount</Table.HeaderCell>
              <Table.HeaderCell></Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.carts.map((cart) => {
              return (
                <Table.Row
                  key={cart.id}
                  className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
                >
                  <Table.Cell>
                    {cart.first_name + " " + cart.last_name}
                  </Table.Cell>
                  <Table.Cell>{cart.email}</Table.Cell>
                  <Table.Cell>{cart.items.length}</Table.Cell>
                  <Table.Cell>{cart.region_name}</Table.Cell>
                  <Table.Cell className="text-right">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: cart.currency,
                    }).format(cart.totalPrice / 100)}
                  </Table.Cell>
                  <Table.Cell className="text-ui-fg-muted">
                    <ReactCountryFlag
                      countryCode={cart.country_code}
                      style={{
                        fontSize: "1.5em",
                        lineHeight: "1.5em",
                      }}
                      title={cart.region_name}
                    />
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
        <Table.Pagination
          count={data.count}
          pageSize={pageSize}
          pageIndex={currentPage}
          pageCount={Math.round(data.count / pageSize)}
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
