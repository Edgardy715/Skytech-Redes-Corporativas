en
conf t
! Ruta predeterminada hacia el ISP
ip route 0.0.0.0 0.0.0.0 1.0.0.10
! 1. Crear el proceso OSPF y ponerle su ID
router ospf 1
 router-id 1.1.1.1
 passive-interface default
 ! e0/1 hacia SW10, e0/0 hacia ISP la dejamos passive
 no passive-interface e0/1
 auto-cost reference-bandwidth 10000
 default-information originate
exit

! 2. Activar OSPF directamente en el enlace físico hacia SW10
int e0/1
 ip ospf 1 area 0
exit
do wr
