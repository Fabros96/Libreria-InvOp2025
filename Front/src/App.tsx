import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ListAltIcon from '@mui/icons-material/ListAlt';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { useState } from 'react';

const drawerWidth = 240;

const modules = [
  { text: 'Artículos', icon: <InventoryIcon /> },
  { text: 'Proveedores', icon: <LocalShippingIcon /> },
  { text: 'Modelo de inventarios', icon: <WarehouseIcon /> },
  { text: 'Listas', icon: <ListAltIcon /> },
  { text: 'Órdenes de compra', icon: <ShoppingCartIcon /> },
  { text: 'Stock actual', icon: <LibraryBooksIcon /> },
  { text: 'Ajustes', icon: <SettingsIcon /> },
  { text: 'Cerrar sesión', icon: <LogoutIcon /> },
];

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap>
          Stock Master
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {modules.map((modulo) => (
          <ListItem key={modulo.text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{modulo.icon}</ListItemIcon>
              <ListItemText primary={modulo.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      {/* App Bar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Stock Master Librería
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Typography variant="h4">Bienvenida, Lore 👋</Typography>
        <Typography variant="body1">
          Seleccioná un módulo en el menú lateral para comenzar.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
