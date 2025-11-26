/**
 * HeroUI Components - Exports
 * 
 * Componentes customizados usando HeroUI integrados com OraclusX DS
 */

export { DataTable, type Column, type DataTableProps } from './DataTable';
export { 
  ConfirmModal, 
  FormModal, 
  type ConfirmModalProps,
  type FormModalProps,
  type ModalVariant,
} from './ConfirmModal';

// Hook exportado de arquivo separado para evitar fast refresh warnings
export { useConfirmModal } from '@/hooks/useConfirmModal';

// Re-export HeroUI primitives mais usados
export {
  // Layout
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Spacer,
  
  // Forms
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Switch,
  Slider,
  
  // Buttons
  Button,
  ButtonGroup,
  
  // Data Display
  Avatar,
  AvatarGroup,
  Badge,
  Chip,
  Code,
  Image,
  User,
  
  // Feedback
  Progress,
  CircularProgress,
  Spinner,
  Skeleton,
  
  // Navigation
  Tabs,
  Tab,
  Breadcrumbs,
  BreadcrumbItem,
  Link,
  Pagination,
  
  // Overlay
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  
  // Data Entry
  Autocomplete,
  AutocompleteItem,
  DatePicker,
  DateInput,
  TimeInput,
  DateRangePicker,
  
  // Table
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  
  // Disclosure
  Accordion,
  AccordionItem,
  
  // Hooks
  useDisclosure,
} from '@heroui/react';

