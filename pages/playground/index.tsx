import {Avatar, Table, Group, Text, ActionIcon, Menu, ScrollArea} from '@mantine/core';
import {
  IconPencil,
  IconMessages,
  IconNote,
  IconReportAnalytics,
  IconTrash,
  IconDots,
} from '@tabler/icons-react';
import * as recipes from 'recipes'

interface UsersStackProps {
  data: {avatar: string; name: string; job: string; email: string; rate: number;}[];
}
const defaultData = [
    {
      "name": "Robert Wolfkisser",
      "rate": 22
    },
    {
      "avatar": "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      "name": "Jill Jailbreaker",
      "job": "Engineer",
      "email": "jj@breaker.com",
      "rate": 45
    },
    {
      "avatar": "https://images.unsplash.com/photo-1632922267756-9b71242b1592?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      "name": "Henry Silkeater",
      "job": "Designer",
      "email": "henry@silkeater.io",
      "rate": 76
    },
    {
      "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      "name": "Bill Horsefighter",
      "job": "Designer",
      "email": "bhorsefighter@gmail.com",
      "rate": 15
    },
    {
      "avatar": "https://images.unsplash.com/photo-1630841539293-bd20634c5d72?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80",
      "name": "Jeremy Footviewer",
      "job": "Manager",
      "email": "jeremy@foot.dev",
      "rate": 98
    }
  ]

export function PlaygroundDashboard({data=Object.keys(recipes).map(name=>({name, ...recipes[name]}))}: UsersStackProps) {
  debugger
  const rows = data.map((item) => (
    <tr key={item.name}>
      <td>
        <Group spacing="sm">
          <Avatar size={40} src={item.avatar} radius={40} />
          <div>
            <Text fz="sm" fw={500}>
              {item.name}
            </Text>
            <Text c="dimmed" fz="xs">
              {item.job}
            </Text>
          </div>
        </Group>
      </td>
      <td>
        <Text fz="sm">{item.email}</Text>
        <Text fz="xs" c="dimmed">
        </Text>
      </td>
      <td>
        <Text fz="sm"></Text>
        <Text fz="xs" c="dimmed">
          Rate
        </Text>
      </td>
      <td>
        <Group spacing={0} position="right">
          <ActionIcon>
            <IconPencil size="1rem" stroke={1.5} />
          </ActionIcon>
          <Menu
            transitionProps={{transition: 'pop'}}
            withArrow
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <ActionIcon>
                <IconDots size="1rem" stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item icon={<IconMessages size="1rem" stroke={1.5} />}>Send message</Menu.Item>
              <Menu.Item icon={<IconNote size="1rem" stroke={1.5} />}>Add note</Menu.Item>
              <Menu.Item icon={<IconReportAnalytics size="1rem" stroke={1.5} />}>
                Analytics
              </Menu.Item>
              <Menu.Item icon={<IconTrash size="1rem" stroke={1.5} />} color="red">
                Terminate contract
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </td>
    </tr>
  ));

  return (
    <ScrollArea>
      <Table sx={{minWidth: 800}} verticalSpacing="md">
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default PlaygroundDashboard