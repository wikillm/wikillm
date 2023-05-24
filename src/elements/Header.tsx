// @ts-nocheck
/* eslint-disable */

import {
  Avatar,
  Burger,
  Container,
  createStyles,
  Group,
  Menu,
  rem,
  Tabs,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconChevronDown,
  IconHeart,
  IconLogout,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';

const MantineLogo = () => <>logo</>;

const useStyles = createStyles((theme) => ({
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === 'dark' ? 'transparent' : theme.colors.gray[2]
    }`,
    // marginBottom: rem(120),
  },

  mainSection: {
    paddingBottom: theme.spacing.sm,
  },

  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },

    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  burger: {
    // [theme.fn.largerThan('xs')]: {
    //   display: 'none',
    // },
  },

  userActive: {
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },

  tabs: {
    [theme.fn.smallerThan('sm')]: {
      display: 'none',
    },
  },

  tabsList: {
    borderBottom: '0 !important',
  },

  tab: {
    fontWeight: 500,
    height: rem(38),
    backgroundColor: 'transparent',

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },

    '&[data-active]': {
      backgroundColor:
        theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
      borderColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
    },
  },
}));

interface HeaderProps {
  user: { name: string; image: string };
  tabs: string[];
  onTabChange: (x: any) => void;
}

export function Header({
  user,
  signIn,
  signOut,
  userLoaded,
  userRoles,
  tabs,
  onTabChange,
}: HeaderProps) {
  const { classes, theme, cx } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  console.log('opened', opened);
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const items = tabs.map((tab, index) => (
    <Tabs.Tab value={tab || `${index + 1}`} key={index}>
      {index}.{tab}
    </Tabs.Tab>
  ));
  console.log(user);
  return (
    <div className={classes.header}>
      <Container className={classes.mainSection}>
        <Group position="apart">
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
          />

          {userLoaded && (
            <Menu
              width={260}
              position="bottom-end"
              transitionProps={{ transition: 'pop-top-right' }}
              onClose={() => {
                setUserMenuOpened(false);
              }}
              onOpen={() => {
                setUserMenuOpened(true);
              }}
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton
                  className={cx(classes.user, {
                    [classes.userActive]: userMenuOpened,
                  })}
                >
                  <Group spacing={7}>
                    <Avatar
                      src={user.image}
                      alt={user.email}
                      radius="xl"
                      size={20}
                    />
                    <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                      {user.email}
                    </Text>
                    <IconChevronDown size={rem(12)} stroke={1.5} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  icon={
                    <IconHeart
                      size="0.9rem"
                      color={theme.colors.red[6]}
                      stroke={1.5}
                    />
                  }
                >
                  My Projects
                </Menu.Item>
                <Menu.Label>Settings</Menu.Label>
                <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />}>
                  Account settings
                </Menu.Item>

                <Menu.Item
                  icon={
                    <IconLogout
                      size="0.9rem"
                      stroke={1.5}
                      onClick={() => {
                        signOut();
                      }}
                    />
                  }
                >
                  Logout
                </Menu.Item>

                <Menu.Divider />

                <Menu.Label>Danger zone</Menu.Label>
                <Menu.Item
                  color="red"
                  icon={<IconTrash size="0.9rem" stroke={1.5} />}
                >
                  Delete account
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Group>
      </Container>
      <Container>
        <Tabs
          defaultValue="Home"
          onTabChange={(tab: string) => {
            onTabChange(tabs.indexOf(tab));
          }}
          variant="outline"
          classNames={{
            root: classes.tabs,
            tabsList: classes.tabsList,
            tab: classes.tab,
          }}
        >
          <Tabs.List>{items}</Tabs.List>
        </Tabs>
      </Container>
    </div>
  );
}
