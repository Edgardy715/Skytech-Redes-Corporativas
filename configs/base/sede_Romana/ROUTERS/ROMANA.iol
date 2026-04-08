!Router (La Romana)

enable
configure terminal
hostname LaRomana

! Interfaz hacia SW10
interface e0/1
 no shutdown
 exit

! Subinterfaces para cada VLAN/Dept
interface e0/1.2
 encapsulation dot1Q 2
 ip address 10.128.0.1 255.255.255.128
 no shutdown
 exit

interface e0/1.3
 encapsulation dot1Q 3
 ip address 10.128.0.129 255.255.255.192
 no shutdown
 exit

interface e0/1.4
 encapsulation dot1Q 4
 ip address 10.128.0.193 255.255.255.240
 no shutdown
 exit

end
write memory