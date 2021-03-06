package s2jh.biz.shop.entity;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;
import javax.persistence.Transient;

import lab.s2jh.core.annotation.MetaData;
import lab.s2jh.core.entity.BaseNativeEntity;
import lab.s2jh.module.auth.entity.User;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import org.hibernate.annotations.Cache;
import org.hibernate.annotations.CacheConcurrencyStrategy;

@Getter
@Setter
@Accessors(chain = true)
@Access(AccessType.FIELD)
@Entity
@Table(name = "shop_SiteUser")
@MetaData(value = "Front-end user information")
@Cache(usage = CacheConcurrencyStrategy.READ_WRITE)
public class SiteUser extends BaseNativeEntity {

    private static final long serialVersionUID = 2686339300612095738L;

    @MetaData(value = "Login account objects")
    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "user_id")
    private User user;

    @MetaData(value = "头像")
    @Column(length = 512)
    private String headPhoto;

    @Override
    @Transient
    public String getDisplay() {
        return user.getDisplay();
    }
}
