package lab.s2jh.module.auth.entity;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.CascadeType;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;
import javax.persistence.UniqueConstraint;

import lab.s2jh.core.annotation.MetaData;
import lab.s2jh.core.entity.BaseNativeEntity;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;
import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

@Getter
@Setter
@Accessors(chain = true)
@Access(AccessType.FIELD)
@Entity
@Table(name = "auth_RoleR2Privilege", uniqueConstraints = @UniqueConstraint(columnNames = { "privilege_id", "role_id" }))
@MetaData(value = "Associated with the role and authority")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
@Audited
public class RoleR2Privilege extends BaseNativeEntity {

    private static final long serialVersionUID = -4312077296555510354L;

    /** Associated rights object */
    @ManyToOne(cascade = CascadeType.DETACH)
    @JoinColumn(name = "privilege_id", nullable = false)
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    private Privilege privilege;

    /** Association role objects */
    @ManyToOne(cascade = CascadeType.DETACH)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;

    @Transient
    @Override
    public String getDisplay() {
        return privilege.getDisplay() + "_" + role.getDisplay();
    }
}
