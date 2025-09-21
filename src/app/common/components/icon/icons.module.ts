import { NgModule } from '@angular/core';
import { FeatherModule } from 'angular-feather';
import { Home, Settings, Search, User, Bell,Upload,Clock,Menu, Hexagon, Box, PieChart, CheckCircle } from 'angular-feather/icons';
import { IconComponent } from './icon.component';

const icons = {
  Home,
  Settings,
  Search,
  User,
  Bell,
  Upload,
  Clock,
  Menu,
  Hexagon,
  Box,
  PieChart,
  CheckCircle
  
};

@NgModule({
    declarations:[IconComponent],
    imports: [FeatherModule.pick(icons)],
    exports:[IconComponent,FeatherModule]
})
export class IconsModule {}
