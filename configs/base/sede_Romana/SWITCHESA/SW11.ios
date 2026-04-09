enable
configure terminal
hostname SW11

! Crear VLANs
vlan 2
 name Dept2
vlan 3
 name Dept1
vlan 4
 name Dept3
exit

! Trunk hacia SW10 (e0/1, e0/2, e0/3 - para EtherChannel luego)
interface range e0/1 - 3
 switchport trunk encapsulation dot1q
 switchport mode trunk
 no shutdown
 exit

end
write memory
