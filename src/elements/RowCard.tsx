import React from "react";
import {
  Card,
  Group,
  Text,
  Menu,
  ActionIcon,
  Image,
  SimpleGrid,
  rem,
  Button,
} from "@mantine/core";
import { IconDots, IconEye, IconFileZip, IconTrash } from "@tabler/icons-react";

export function RowCard({ menu, title, subtitle, content, onClick, ...node }) {
  return (
    <Card withBorder shadow="sm" radius="md">
      <Card.Section withBorder inheritPadding py="xs">
        <Group position="apart">
          <div className="row-card--top	">
            <Text>{title}</Text>
            {menu && (
              <Menu withinPortal position="bottom-end" shadow="sm">
                <Menu.Target>
                  <ActionIcon>
                    <IconDots size="1rem" />
                  </ActionIcon>
                </Menu.Target>

                <Menu.Dropdown>
                  {menu.map((item) => {
                    return (
                      <Menu.Item key={item.label} icon={item.icon}>
                        {item.label}
                      </Menu.Item>
                    );
                  })}
                </Menu.Dropdown>
              </Menu>
            )}
          </div>
          <Text color={"dimmed"} size={"xs"}>
            {subtitle}
          </Text>
        </Group>
      </Card.Section>

      <Card.Section className="flex">
        <Text mt="sm" color="dimmed" size="sm">
          {content}
        </Text>
        <Button
          style={{ height: "inherit", padding: "0.3rem" }}
          onClick={onClick}
        >
          {">"}
        </Button>
      </Card.Section>
    </Card>
  );
}
